/**
 * Phase 0 spike — message contract between the extension host and the
 * mic webview. Types only; safe to import from either side.
 *
 * Two capture paths feed the same Scribe pipeline:
 *  - webview: navigator.mediaDevices (blocked by VS Code's permissions
 *    policy on desktop — see micDenied) 
 *  - host: extension-spawned system capture (pw-record/arecord/ffmpeg),
 *    PCM forwarded to the webview as base64 frames.
 */

export type SpikeToExtension =
  | { type: "ready" }
  | { type: "log"; message: string }
  | { type: "mic"; ok: boolean; detail: string; devices: number; sampleRate: number }
  /** Webview getUserMedia failed — host shows the VS Code popup + offers system capture. */
  | {
      type: "micDenied";
      name: string;
      message: string;
      policyAllowed: boolean | null;
      secureContext: boolean;
    }
  | { type: "connectScribe" }
  | { type: "forgetKey" }
  | { type: "hostCaptureStart" }
  | { type: "hostCaptureStop" }
  /** Final Scribe transcript — persisted to the transcripts log by the host. */
  | { type: "transcript"; requestId: string; text: string; usage?: unknown };

export type ExtensionToSpike =
  | { type: "init"; hasApiKey: boolean }
  | { type: "scribeSession"; ok: true; wsUrl: string; ticket: string; requestId: string }
  | { type: "scribeSession"; ok: false; error: string }
  /** Base64 of exactly one 3200-byte PCM16 LE @ 16 kHz frame from host capture. */
  | { type: "hostPcm"; data: string }
  | { type: "hostLog"; line: string }
  | {
      type: "hostCaptureStatus";
      state: "starting" | "running" | "stopped";
      backend?: string;
      error?: string;
    }
  | { type: "retryMic" };
