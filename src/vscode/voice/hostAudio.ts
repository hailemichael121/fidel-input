/**
 * Phase 0 spike — host-side microphone capture.
 *
 * VS Code blocks getUserMedia inside extension webviews (permissions
 * policy, no prompt possible — microsoft/vscode#113916, #303293), so the
 * fallback records straight from the OS audio stack in the extension
 * host. No browser permission is involved. Verified on this machine:
 *
 *   pw-record --rate 16000 --channels 1 --format s16 --container raw -
 *
 * streams raw PCM16 LE mono @ 16 kHz on stdout at exactly 32000 B/s.
 * The stdout stream is cut into Scribe-sized 3200-byte frames (100 ms)
 * and handed to the panel, which forwards them to the webview for the
 * meter + WebSocket pipeline.
 */
import { spawn, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export const HOST_RATE = 16000;
export const HOST_FRAME_BYTES = (HOST_RATE / 10) * 2; // 100 ms of PCM16 = 3200 B

export interface CaptureBackend {
  id: string;
  command: string;
  args: string[];
  note?: string;
}

function which(command: string): string | null {
  const exts = process.platform === "win32" ? [".exe", ".cmd", ""] : [""];
  for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      try {
        const candidate = path.join(dir, command + ext);
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      } catch {
        /* keep looking */
      }
    }
  }
  return null;
}

/** First available capture backend for this platform (raw PCM16 LE @ 16 kHz mono on stdout). */
export function detectHostCapture(): CaptureBackend | null {
  if (process.platform === "linux") {
    if (which("pw-record")) {
      return {
        id: "pipewire",
        command: "pw-record",
        args: ["--rate", String(HOST_RATE), "--channels", "1", "--format", "s16", "--container", "raw", "-"],
        note: "PipeWire (default source)",
      };
    }
    if (which("arecord")) {
      return {
        id: "alsa",
        command: "arecord",
        args: ["-q", "-r", String(HOST_RATE), "-c", "1", "-f", "S16_LE", "-t", "raw", "-"],
        note: "ALSA default device",
      };
    }
    if (which("ffmpeg")) {
      return {
        id: "ffmpeg-pulse",
        command: "ffmpeg",
        args: ["-hide_banner", "-loglevel", "error", "-f", "pulse", "-i", "default", "-ac", "1", "-ar", String(HOST_RATE), "-f", "s16le", "-"],
        note: "PulseAudio via ffmpeg",
      };
    }
    return null;
  }
  if (process.platform === "darwin" && which("ffmpeg")) {
    return {
      id: "ffmpeg-avfoundation",
      command: "ffmpeg",
      args: ["-hide_banner", "-loglevel", "error", "-f", "avfoundation", "-i", ":0", "-ac", "1", "-ar", String(HOST_RATE), "-f", "s16le", "-"],
      note: "AVFoundation via ffmpeg (experimental)",
    };
  }
  if (process.platform === "win32" && which("ffmpeg")) {
    return {
      id: "ffmpeg-dshow",
      command: "ffmpeg",
      args: ["-hide_banner", "-loglevel", "error", "-f", "dshow", "-i", "audio=default", "-ac", "1", "-ar", String(HOST_RATE), "-f", "s16le", "-"],
      note: "DirectShow via ffmpeg (experimental)",
    };
  }
  return null;
}

export type CaptureState = "starting" | "running" | "stopped";

export class HostCapture {
  private child: ChildProcess | null = null;
  private pending: Buffer = Buffer.alloc(0);
  private backendId: string | null = null;

  constructor(
    private readonly onFrame: (frame: Buffer) => void,
    private readonly onLog: (line: string) => void,
    private readonly onState: (state: CaptureState, backend?: string, error?: string) => void
  ) {}

  public get running(): boolean {
    return this.child !== null;
  }

  public get backend(): string | null {
    return this.backendId;
  }

  public start(): void {
    if (this.child) return;
    const backend = detectHostCapture();
    if (!backend) {
      const error = "No capture backend found — install pipewire (pw-record), alsa-utils (arecord), or ffmpeg.";
      this.onLog(error);
      this.onState("stopped", undefined, error);
      return;
    }

    this.onLog(`Starting ${backend.command} → raw PCM16 LE @ ${HOST_RATE} Hz mono (${backend.note ?? "system default source"})`);
    this.onState("starting", backend.id);

    const child = spawn(backend.command, backend.args, { stdio: ["ignore", "pipe", "pipe"] });
    this.child = child;
    this.backendId = backend.id;
    this.pending = Buffer.alloc(0);

    child.stdout?.on("data", (chunk: Buffer) => {
      this.pending = Buffer.concat([this.pending, chunk]);
      while (this.pending.length >= HOST_FRAME_BYTES) {
        this.onFrame(this.pending.subarray(0, HOST_FRAME_BYTES));
        this.pending = this.pending.subarray(HOST_FRAME_BYTES);
      }
    });

    let stderrTail = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderrTail = (stderrTail + chunk.toString()).slice(-2000);
    });

    child.on("error", (err) => {
      if (this.child !== child) return;
      this.child = null;
      const error = `failed to start ${backend.command}: ${err.message}`;
      this.onLog(error);
      this.onState("stopped", backend.id, error);
    });

    child.on("exit", (code, signal) => {
      if (this.child !== child) return; // user-initiated stop already reported
      this.child = null;
      this.pending = Buffer.alloc(0);
      const detail = stderrTail.trim() ? ` — ${stderrTail.trim().slice(0, 400)}` : "";
      const error = code === 0 || signal ? undefined : `capture exited with code ${code}${detail}`;
      this.onLog(`capture exited (code=${code}, signal=${signal})${detail}`);
      this.onState("stopped", backend.id, error);
    });

    this.onState("running", backend.id);
    this.onLog("System mic capture running — frames stream to the webview.");
  }

  public stop(): void {
    const child = this.child;
    if (!child) return;
    this.child = null;
    this.pending = Buffer.alloc(0);
    try {
      child.kill("SIGTERM");
    } catch {
      /* already gone */
    }
    this.onLog("System mic capture stopped.");
    this.onState("stopped", this.backendId ?? undefined);
  }

  public dispose(): void {
    try {
      this.child?.kill("SIGTERM");
    } catch {
      /* already gone */
    }
    this.child = null;
  }
}
