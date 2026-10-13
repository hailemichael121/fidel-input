import * as vscode from "vscode";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionToSpike, SpikeToExtension } from "./spikeProtocol.js";
import { HostCapture } from "./hostAudio.js";

/**
 * Phase 0 spike (docs/asr-integration-plan.md): mic → Addis Scribe cloud
 * WebSocket → output channel. Throwaway scaffolding — answers "does the
 * mic work, and does PCM reach Scribe?" before Phase 1 builds the real
 * voice layer.
 *
 * Mic reality on desktop: VS Code sandboxes extension webviews without
 * microphone in their permissions policy, so getUserMedia is rejected
 * silently and NO browser prompt can appear (microsoft/vscode#113916,
 * #303293). We therefore:
 *   1. ask for consent with our own in-webview popup (explicit ask),
 *   2. still try getUserMedia (works wherever policy allows),
 *   3. on denial show a real VS Code popup offering the host-capture
 *      fallback (PipeWire/ALSA/ffmpeg — no browser permission needed).
 *
 * Transcripts ("what the audio said") are written to a persistent JSONL
 * file plus the output channel, which survives panel close.
 */

const API_KEY_SECRET = "fidel.voice.addisApiKey";
const SCRIBE_BASE_URL = "https://api.addisassistant.com";
const WEBVIEW_BLOCKED_EXPLANATION =
  "VS Code renders this panel inside a sandboxed iframe that does not allow the microphone " +
  "(permissions policy), so getUserMedia is rejected before any “Allow microphone” prompt can " +
  "appear — and the extension API has no way to change that (microsoft/vscode#113916, #303293). " +
  "“Use system mic capture” records directly through PipeWire/ALSA/ffmpeg in the extension host " +
  "instead — no browser permission is involved. Remember: your default mic must be unmuted " +
  "(wpctl set-mute @DEFAULT_AUDIO_SOURCE@ 0).";

export function registerVoiceSpike(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("fidel.voice.spike", () => SpikePanel.createOrShow(context))
  );
}

class SpikePanel {
  private static current: SpikePanel | undefined;
  private static channel: vscode.OutputChannel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private readonly capture: HostCapture;
  private disposed = false;

  public static createOrShow(context: vscode.ExtensionContext): void {
    if (SpikePanel.current) {
      SpikePanel.current.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }
    SpikePanel.current = new SpikePanel(context);
  }

  /** Output channel is created once and outlives the panel so transcripts survive close. */
  private static getChannel(): vscode.OutputChannel {
    if (!SpikePanel.channel) {
      SpikePanel.channel = vscode.window.createOutputChannel("Fidel Voice Spike");
    }
    return SpikePanel.channel;
  }

  private get channel(): vscode.OutputChannel {
    return SpikePanel.getChannel();
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;

    this.capture = new HostCapture(
      (frame) => this.post({ type: "hostPcm", data: frame.toString("base64") }),
      (line) => {
        this.channel.appendLine(`[host-audio] ${line}`);
        this.post({ type: "hostLog", line });
      },
      (state, backend, error) => {
        this.post({ type: "hostCaptureStatus", state, backend, error });
        if (state === "running") {
          vscode.window.setStatusBarMessage(`ፊደል Voice: system mic capture active (${backend})`, 4000);
        } else if (error) {
          vscode.window.setStatusBarMessage(`ፊደል Voice: capture failed — ${error}`, 5000);
        }
      }
    );

    this.panel = vscode.window.createWebviewPanel(
      "fidelVoiceSpike",
      "Fidel Voice Spike",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "dist")],
      }
    );
    this.panel.webview.html = this.getHtml(this.panel.webview);
    this.panel.onDidDispose(() => {
      this.disposed = true;
      this.capture.dispose();
      this.channel.appendLine("— panel closed (output channel stays open; transcripts persist) —");
      SpikePanel.current = undefined;
    });
    this.panel.webview.onDidReceiveMessage((msg) => void this.onMessage(msg as SpikeToExtension));
    this.channel.show(true);
    this.channel.appendLine("Phase 0 spike opened.");
    this.channel.appendLine(`Transcripts file: ${this.transcriptsPath()}`);
  }

  private async onMessage(msg: SpikeToExtension): Promise<void> {
    switch (msg.type) {
      case "ready": {
        const key = await this.context.secrets.get(API_KEY_SECRET);
        this.post({ type: "init", hasApiKey: Boolean(key) });
        this.channel.appendLine(
          `Webview ready. Addis API key: ${key ? "stored" : "not set (will prompt on connect)"}`
        );
        break;
      }
      case "log":
        this.channel.appendLine(msg.message);
        break;
      case "mic":
        this.channel.appendLine(
          `Mic ${msg.ok ? "OK" : "FAILED"} — ${msg.detail}; devices=${msg.devices}; audioContextRate=${msg.sampleRate}Hz`
        );
        vscode.window.setStatusBarMessage(
          msg.ok ? "ፊደል Voice Spike: microphone OK" : "ፊደል Voice Spike: microphone FAILED",
          3000
        );
        break;
      case "micDenied":
        await this.onMicDenied(msg);
        break;
      case "connectScribe":
        await this.mintScribeSession();
        break;
      case "forgetKey":
        await this.context.secrets.delete(API_KEY_SECRET);
        this.channel.appendLine("Addis API key removed from SecretStorage.");
        this.post({ type: "init", hasApiKey: false });
        break;
      case "hostCaptureStart":
        this.capture.start();
        break;
      case "hostCaptureStop":
        this.capture.stop();
        break;
      case "transcript":
        this.recordTranscript(msg.requestId, msg.text, msg.usage);
        break;
    }
  }

  /** Webview mic was refused by VS Code — surface a real popup with a working alternative. */
  private async onMicDenied(
    m: Extract<SpikeToExtension, { type: "micDenied" }>
  ): Promise<void> {
    this.channel.appendLine(
      `Webview mic denied: ${m.name} — ${m.message} (secureContext=${m.secureContext}, permissionsPolicy.allowsFeature("microphone")=${String(m.policyAllowed)})`
    );
    const choice = await vscode.window.showWarningMessage(
      `Fidel Voice: VS Code blocked the microphone inside the webview (${m.name}). No permission prompt can appear — its sandbox forbids mic access.`,
      "Use system mic capture",
      "Retry webview mic",
      "Why is this blocked?"
    );
    if (choice === "Use system mic capture") {
      this.capture.start();
    } else if (choice === "Retry webview mic") {
      this.post({ type: "retryMic" });
    } else if (choice === "Why is this blocked?") {
      await vscode.window.showInformationMessage(WEBVIEW_BLOCKED_EXPLANATION, "Show output").then(
        (sel) => {
          if (sel === "Show output") this.channel.show(true);
        }
      );
    }
  }

  /** Persist "what the audio said": output channel section + JSONL file (survives restarts). */
  private recordTranscript(requestId: string, text: string, usage?: unknown): void {
    this.channel.appendLine(`══ TRANSCRIPT (${requestId}) ══`);
    this.channel.appendLine(`HEARD (final): ${text}`);
    if (usage !== undefined) this.channel.appendLine(`usage: ${JSON.stringify(usage)}`);
    try {
      const file = this.transcriptsPath();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), requestId, text, usage }) + "\n");
    } catch (err) {
      this.channel.appendLine(`Could not write transcript file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private transcriptsPath(): string {
    return path.join(this.context.globalStorageUri.fsPath, "fidel-voice-spike-transcripts.jsonl");
  }

  /** POST /api/v1/scribe/sessions — mints a one-use ticket; key never enters the webview. */
  private async mintScribeSession(): Promise<void> {
    let key = await this.context.secrets.get(API_KEY_SECRET);
    if (!key) {
      const entered = await vscode.window.showInputBox({
        title: "Fidel Voice Spike — Addis API key",
        prompt: "Addis Assistant API key (stored in VS Code SecretStorage, never in the webview)",
        password: true,
        ignoreFocusOut: true,
      });
      if (!entered || !entered.trim()) {
        this.post({ type: "scribeSession", ok: false, error: "No API key provided — cancelled." });
        return;
      }
      key = entered.trim();
      await this.context.secrets.store(API_KEY_SECRET, key);
      this.channel.appendLine("Addis API key stored in SecretStorage.");
    }

    const requestId = `fidel-spike-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.channel.appendLine(`Creating Scribe session (request_id=${requestId})…`);

    try {
      const res = await fetch(`${SCRIBE_BASE_URL}/api/v1/scribe/sessions`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key },
        body: JSON.stringify({ backend: "standard", chunk: "320ms", request_id: requestId }),
      });
      const body = (await res.json().catch(() => undefined)) as Record<string, any> | undefined;

      if (!res.ok) {
        const detail =
          (body?.error as string) || (body?.message as string) || JSON.stringify(body ?? {});
        const hint =
          res.status === 429
            ? " (429 — one transcription per wallet is admitted at a time; retry when idle.)"
            : "";
        const error = `Session mint failed: HTTP ${res.status} ${detail}${hint}`;
        this.channel.appendLine(error);
        this.post({ type: "scribeSession", ok: false, error });
        return;
      }

      const data = (body?.data ?? body) as Record<string, any>;
      const wsUrl = data?.websocket_url as string | undefined;
      const ticket = (data?.ticket ?? data?.token ?? data?.one_use_ticket) as string | undefined;
      if (!wsUrl || !ticket) {
        const error = `Unexpected session response shape: ${JSON.stringify(body).slice(0, 300)}`;
        this.channel.appendLine(error);
        this.post({ type: "scribeSession", ok: false, error });
        return;
      }

      this.channel.appendLine(`Session OK → ${wsUrl}`);
      this.channel.appendLine(
        "Billing reminder: ~3.5 ETB / 1000 final characters; 180 s max; partials are free."
      );
      this.post({ type: "scribeSession", ok: true, wsUrl, ticket, requestId });
    } catch (err) {
      const error = `Session mint error: ${err instanceof Error ? err.message : String(err)}`;
      this.channel.appendLine(error);
      this.post({ type: "scribeSession", ok: false, error });
    }
  }

  private post(msg: ExtensionToSpike): void {
    if (this.disposed) return;
    void Promise.resolve(this.panel.webview.postMessage(msg)).catch(() => {
      /* panel went away mid-flight */
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = randomUUID();
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "dist", "voiceSpike.js")
    );
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src https: wss: ws:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fidel Voice Spike</title>
  <style>
    :root { --level: 0%; }
    * { box-sizing: border-box; }
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground);
      background: var(--vscode-editor-background); margin: 0; padding: 18px 18px 96px; }
    h1 { font-size: 1.05em; font-weight: 600; margin: 0 0 2px; }
    .tag { font-size: 0.72em; font-weight: 400; color: var(--vscode-descriptionForeground);
      border: 1px solid var(--vscode-panel-border); border-radius: 10px; padding: 2px 8px; margin-left: 8px; }
    .status { color: var(--vscode-descriptionForeground); font-size: 0.92em; min-height: 1.3em; margin-top: 8px; }
    .meter { height: 6px; background: var(--vscode-progressBar-background); border-radius: 3px;
      overflow: hidden; margin-top: 6px; max-width: 420px; }
    #levelBar { height: 100%; width: 0%; background: var(--vscode-charts-green); transition: width 70ms linear; }
    .heard { margin-top: 14px; border: 1px solid var(--vscode-panel-border); border-radius: 8px;
      padding: 10px 12px; background: var(--vscode-sideBar-background, var(--vscode-editor-background)); }
    .heard[hidden] { display: none; }
    .heard-label { font-size: 0.72em; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
    #heardText { font-size: 1.25em; line-height: 1.5; word-break: break-word; }
    #heardText.final { color: var(--vscode-charts-green); }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 8px; }
    button { font: inherit; padding: 5px 12px; cursor: pointer; border: none; border-radius: 3px;
      background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    button.ghost { background: transparent; color: var(--vscode-descriptionForeground);
      border: 1px solid var(--vscode-panel-border); }
    button.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    button:disabled { opacity: 0.5; cursor: default; }
    details { margin-top: 6px; }
    summary { cursor: pointer; color: var(--vscode-descriptionForeground); font-size: 0.9em; }
    #log { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border);
      padding: 8px; height: 240px; overflow-y: auto; white-space: pre-wrap; word-break: break-word;
      font-size: 0.82em; margin-top: 6px; }

    /* ── Floating skeuomorphic mic button ─────────────────────────── */
    .fab { position: fixed; right: 26px; bottom: 26px; width: 68px; height: 68px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.14); cursor: pointer; padding: 0;
      background: radial-gradient(circle at 32% 26%, rgba(255,255,255,0.22), rgba(255,255,255,0) 46%),
                  linear-gradient(160deg, #4a5162 0%, #2c313c 55%, #1c2028 100%);
      box-shadow: 0 12px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.22),
                  inset 0 -3px 8px rgba(0,0,0,0.55);
      display: grid; place-items: center; transition: transform 120ms ease, box-shadow 120ms ease;
      z-index: 10; }
    .fab:hover { transform: translateY(-2px); }
    .fab:active { transform: translateY(1px); }
    .fab .fab-icon { width: 26px; height: 26px; fill: #dfe3ea; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.6)); }
    .fab::before { content: ""; position: absolute; inset: -7px; border-radius: 50%;
      background: conic-gradient(var(--vscode-charts-green) var(--level), rgba(255,255,255,0.06) 0);
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
      opacity: 0; transition: opacity 160ms ease; }
    .fab.recording::before { opacity: 1; }
    .fab.recording { background: radial-gradient(circle at 32% 26%, rgba(255,255,255,0.18), rgba(255,255,255,0) 46%),
                  linear-gradient(160deg, #b3404a 0%, #8d2833 55%, #5f1a22 100%); }
    .fab .fab-dot { position: absolute; top: 12px; right: 12px; width: 9px; height: 9px; border-radius: 50%;
      background: #ff5a5a; box-shadow: 0 0 6px #ff5a5a; opacity: 0; }
    .fab.recording .fab-dot { opacity: 1; animation: fabPulse 1.2s ease-in-out infinite; }
    @keyframes fabPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.55; } }

    /* ── Consent popup (our explicit permission ask) ─────────────── */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: grid; place-items: center; z-index: 20; }
    .overlay[hidden] { display: none; }
    .dialog { width: min(380px, calc(100vw - 48px)); background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
      border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border)); border-radius: 10px;
      padding: 20px 20px 16px; text-align: center; box-shadow: 0 18px 44px rgba(0,0,0,0.6); }
    .dialog-mic { font-size: 30px; }
    .dialog-title { font-weight: 600; margin: 8px 0 6px; font-size: 1em; }
    .dialog-body { font-size: 0.85em; color: var(--vscode-descriptionForeground); margin: 0 0 14px; line-height: 1.45; }
    .dialog-actions { display: flex; gap: 8px; justify-content: flex-end; }
  </style>
</head>
<body>
  <h1>Fidel Voice <span class="tag">Phase 0 spike</span></h1>
  <div id="status" class="status">Idle — click the mic.</div>
  <div class="meter"><div id="levelBar"></div></div>

  <div id="heard" class="heard" hidden>
    <div class="heard-label">Transcript — what the mic heard</div>
    <div id="heardText"></div>
  </div>

  <div class="actions">
    <button id="btnScribe">Connect Scribe</button>
    <button id="btnForgetKey" class="ghost">Forget API key &amp; consent</button>
    <button id="btnClear" class="ghost">Clear log</button>
  </div>

  <details open>
    <summary>Log</summary>
    <pre id="log"></pre>
  </details>

  <button id="btnMic" class="fab" title="Start microphone" aria-label="Toggle microphone">
    <svg class="fab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>
    <span class="fab-dot"></span>
  </button>

  <div id="consent" class="overlay" hidden>
    <div class="dialog" role="dialog" aria-modal="true">
      <div class="dialog-mic">🎤</div>
      <p class="dialog-title">Fidel Input wants to use your microphone</p>
      <p class="dialog-body">Amharic speech is captured for Ge'ez dictation. While Scribe is connected,
        16&nbsp;kHz audio streams to Addis Scribe (billed per final transcript). Nothing leaves your machine otherwise.</p>
      <div class="dialog-actions">
        <button id="consentDeny" class="ghost">Don't allow</button>
        <button id="consentAllow" class="primary">Allow microphone</button>
      </div>
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
