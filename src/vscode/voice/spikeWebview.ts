/**
 * Phase 0 spike — webview side. Minimal, floating, skeuomorphic mic UI.
 *
 * Capture flow:
 *  1. Click the floating mic → Fidel's own consent popup (explicit ask).
 *  2. Allow → probe permissions policy → try getUserMedia.
 *     - VS Code desktop blocks it (policy) → micDenied → the extension
 *       host shows a real VS Code popup offering system capture.
 *  3. System capture (host) → base64 PCM16 frames → same pipeline.
 *
 * Both sources feed one pipeline: level ring → 100 ms frames → Addis
 * Scribe WebSocket → partial/final transcripts (the "heard" panel +
 * output-channel log). Never touches CompositionEngine.
 */
import type { ExtensionToSpike, SpikeToExtension } from "./spikeProtocol.js";

interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): { consent?: boolean; webviewBlocked?: boolean } | undefined;
  setState(state: { consent?: boolean; webviewBlocked?: boolean }): void;
}
declare function acquireVsCodeApi(): VsCodeApi;

const vscodeApi = acquireVsCodeApi();

const TARGET_RATE = 16000;
const FRAME_SAMPLES = TARGET_RATE / 10; // 100 ms @ 16 kHz = 1600 samples (3200 B)
const FRAME_BYTES = FRAME_SAMPLES * 2;

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`spike webview: #${id} missing`);
  return node as T;
}

const btnMic = el<HTMLButtonElement>("btnMic");
const btnScribe = el<HTMLButtonElement>("btnScribe");
const btnForgetKey = el<HTMLButtonElement>("btnForgetKey");
const btnClear = el<HTMLButtonElement>("btnClear");
const meter = el<HTMLDivElement>("levelBar");
const statusEl = el<HTMLDivElement>("status");
const logEl = el<HTMLPreElement>("log");
const heard = el<HTMLDivElement>("heard");
const heardText = el<HTMLDivElement>("heardText");
const consent = el<HTMLDivElement>("consent");
const consentAllow = el<HTMLButtonElement>("consentAllow");
const consentDeny = el<HTMLButtonElement>("consentDeny");

function post(msg: SpikeToExtension): void {
  vscodeApi.postMessage(msg);
}

function log(message: string): void {
  const stamp = new Date().toTimeString().slice(0, 8);
  logEl.textContent += `[${stamp}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
  post({ type: "log", message });
}

function setStatus(text: string): void {
  statusEl.textContent = text;
}

function showHeard(text: string, final: boolean): void {
  heard.hidden = false;
  heardText.textContent = text;
  heardText.classList.toggle("final", final);
}

// ── Capture state ────────────────────────────────────────────────────────

let captureSource: "none" | "webview" | "host" = "none";
let consentGranted: boolean = vscodeApi.getState()?.consent === true;
let webviewBlocked: boolean = vscodeApi.getState()?.webviewBlocked === true;

function updateFab(): void {
  const active = captureSource !== "none";
  btnMic.classList.toggle("recording", active);
  btnMic.title = active ? "Stop microphone" : "Start microphone";
  if (!active) {
    meter.style.width = "0%";
    btnMic.style.setProperty("--level", "0%");
  }
}

// ── Mic capture (webview path) ───────────────────────────────────────────

let micStream: MediaStream | null = null;
let audioCtx: AudioContext | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let processorNode: ScriptProcessorNode | null = null;
let muteNode: GainNode | null = null;
let ctxRate = TARGET_RATE;

let frame = new Float32Array(FRAME_SAMPLES);
let frameLen = 0;
let framesSent = 0;
let lastLevelLog = 0;

async function startMic(): Promise<boolean> {
  if (captureSource === "webview") return true;
  log("Requesting microphone…");

  // Permissions-policy probe: tells us WHY a failure is about to happen.
  const policyApi =
    (document as unknown as { permissionsPolicy?: PermissionsPolicyLike }).permissionsPolicy ??
    (document as unknown as { featurePolicy?: PermissionsPolicyLike }).featurePolicy;
  let policyAllowed: boolean | null = null;
  try {
    policyAllowed = policyApi?.allowsFeature?.("microphone") ?? null;
  } catch {
    policyAllowed = null;
  }
  log(
    `probe: isSecureContext=${window.isSecureContext}, permissionsPolicy.allowsFeature("microphone")=${String(policyAllowed)}`
  );

  try {
    const perms = await navigator.permissions.query({ name: "microphone" as PermissionName });
    log(`navigator.permissions: microphone = ${perms.state}`);
    perms.onchange = () => log(`microphone permission changed → ${perms.state}`);
  } catch {
    log("navigator.permissions has no 'microphone' (falling back to getUserMedia prompt)");
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (err) {
    const e = err as DOMException;
    log(`getUserMedia FAILED: ${e.name} — ${e.message}`);
    setStatus(`VS Code blocked the microphone (${e.name}) — check the popup in the editor.`);
    webviewBlocked = true;
    vscodeApi.setState({ consent: consentGranted, webviewBlocked: true });
    post({
      type: "micDenied",
      name: e.name,
      message: e.message,
      policyAllowed,
      secureContext: window.isSecureContext,
    });
    return false;
  }

  let devices: MediaDeviceInfo[] = [];
  try {
    devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
  } catch (err) {
    log(`enumerateDevices failed: ${String(err)}`);
  }
  const labels = devices.map((d, i) => `${i}: ${d.label || "(label hidden)"}`).join(" | ");
  log(`getUserMedia OK — ${devices.length} audioinput device(s): ${labels || "(none reported)"}`);

  try {
    audioCtx = new AudioContext({ sampleRate: TARGET_RATE });
  } catch {
    audioCtx = new AudioContext();
  }
  ctxRate = audioCtx.sampleRate;
  log(
    `AudioContext rate ${ctxRate} Hz${ctxRate === TARGET_RATE ? "" : ` — downsampling to ${TARGET_RATE} Hz in JS`}`
  );

  sourceNode = audioCtx.createMediaStreamSource(micStream);
  processorNode = audioCtx.createScriptProcessor(4096, 1, 1);
  processorNode.onaudioprocess = onAudio;
  muteNode = audioCtx.createGain();
  muteNode.gain.value = 0;
  sourceNode.connect(processorNode);
  processorNode.connect(muteNode);
  muteNode.connect(audioCtx.destination);
  if (audioCtx.state === "suspended") await audioCtx.resume();

  captureSource = "webview";
  frameLen = 0;
  framesSent = 0;
  updateFab();
  setStatus("Mic live — speak and watch the ring.");
  post({
    type: "mic",
    ok: true,
    detail: `${devices.length} input(s), ${labels}`,
    devices: devices.length,
    sampleRate: ctxRate,
  });
  return true;
}

function stopMic(reason = "Mic stopped."): void {
  processorNode && (processorNode.onaudioprocess = null);
  sourceNode?.disconnect();
  processorNode?.disconnect();
  muteNode?.disconnect();
  void audioCtx?.close();
  micStream?.getTracks().forEach((t) => t.stop());
  micStream = null;
  audioCtx = null;
  if (captureSource === "webview") captureSource = "none";
  updateFab();
  setStatus(reason);
}

interface PermissionsPolicyLike {
  allowsFeature(feature: string): boolean;
}

/** Linear-interpolation resample — spike-quality, replaced by AudioWorklet in Phase 1. */
function resampleLinear(input: Float32Array, from: number, to: number): Float32Array {
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const frac = pos - i0;
    const s0 = input[i0];
    const s1 = input[Math.min(i0 + 1, input.length - 1)];
    out[i] = s0 + (s1 - s0) * frac;
  }
  return out;
}

function onAudio(e: AudioProcessingEvent): void {
  const input = e.inputBuffer.getChannelData(0);
  pushSamples(ctxRate === TARGET_RATE ? input : resampleLinear(input, ctxRate, TARGET_RATE));
}

/** Shared pipeline: level ring + 100 ms frame accumulation (webview mic and host PCM). */
function pushSamples(samples: Float32Array): void {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / samples.length);
  setMeter(rms);

  let offset = 0;
  while (offset < samples.length) {
    const take = Math.min(FRAME_SAMPLES - frameLen, samples.length - offset);
    frame.set(samples.subarray(offset, offset + take), frameLen);
    frameLen += take;
    offset += take;
    if (frameLen === FRAME_SAMPLES) {
      flushFrame();
      frameLen = 0;
    }
  }
}

function setMeter(rms: number): void {
  const db = 20 * Math.log10(Math.max(rms, 1e-6));
  const pct = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  meter.style.width = `${pct}%`;
  btnMic.style.setProperty("--level", `${pct}%`);
  const now = Date.now();
  if (now - lastLevelLog > 3000 && captureSource !== "none") {
    lastLevelLog = now;
    log(`level ${db.toFixed(1)} dB · PCM frames sent ${framesSent}`);
  }
}

function flushFrame(): void {
  if (!ws || ws.readyState !== WebSocket.OPEN || !scribeReady) return;
  const pcm = new Int16Array(FRAME_SAMPLES);
  for (let i = 0; i < FRAME_SAMPLES; i++) {
    const s = Math.max(-1, Math.min(1, frame[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  ws.send(pcm.buffer);
  framesSent++;
  if (framesSent === 1 || framesSent % 100 === 0) {
    log(`sent frame #${framesSent} (${FRAME_BYTES} B)`);
  }
}

// ── Host capture path (PCM forwarded from the extension host) ────────────

function feedHostPcm(b64: string): void {
  if (captureSource === "none") captureSource = "host";
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    log("hostPcm: invalid base64 frame — ignored");
    return;
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
  const samples = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) samples[i] = pcm[i] / 32768;
  pushSamples(samples);
}

// ── Addis Scribe streaming ───────────────────────────────────────────────

let ws: WebSocket | null = null;
let scribeReady = false;
let dictating = false;
let lastPartial = "";
let scribeRequestId = "";
let finishTimer: number | undefined;

btnMic.addEventListener("click", () => {
  if (captureSource === "webview") {
    stopMic();
    return;
  }
  if (captureSource === "host") {
    post({ type: "hostCaptureStop" });
    setStatus("Stopping system capture…");
    return;
  }
  if (!consentGranted) {
    consent.hidden = false; // our explicit permission ask
    return;
  }
  if (webviewBlocked) {
    setStatus("Starting system mic capture…");
    post({ type: "hostCaptureStart" });
    return;
  }
  void startMic();
});

consentAllow.addEventListener("click", () => {
  consent.hidden = true;
  consentGranted = true;
  vscodeApi.setState({ consent: true, webviewBlocked });
  log("Microphone use allowed in Fidel's consent dialog.");
  if (webviewBlocked) {
    setStatus("Starting system mic capture…");
    post({ type: "hostCaptureStart" });
  } else {
    void startMic();
  }
});

consentDeny.addEventListener("click", () => {
  consent.hidden = true;
  log("Microphone declined in Fidel's consent dialog.");
});

btnForgetKey.addEventListener("click", () => {
  consentGranted = false;
  webviewBlocked = false;
  vscodeApi.setState({ consent: false, webviewBlocked: false });
  post({ type: "forgetKey" });
  log("Reset — API key (host) and consent/webview-blocked memory cleared.");
});

btnClear.addEventListener("click", () => {
  logEl.textContent = "";
});

btnScribe.addEventListener("click", () => {
  if (dictating || ws) {
    stopDictation();
    return;
  }
  if (captureSource === "none") {
    if (consentGranted && webviewBlocked) {
      post({ type: "hostCaptureStart" });
    } else if (consentGranted) {
      void startMic();
    } else {
      consent.hidden = false;
      return;
    }
  }
  setStatus("Requesting Scribe session…");
  post({ type: "connectScribe" });
});

window.addEventListener("message", (ev: MessageEvent<ExtensionToSpike>) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;
  switch (msg.type) {
    case "init":
      log(
        `Addis API key: ${msg.hasApiKey ? "stored" : "not set (will prompt on connect)"}` +
          (consentGranted ? " · mic consent: granted" : " · mic consent: not yet asked")
      );
      break;
    case "scribeSession":
      if (msg.ok) {
        scribeRequestId = msg.requestId;
        void openScribeSocket(msg.wsUrl, msg.ticket, msg.requestId);
      } else {
        log(`Scribe session failed — ${msg.error}`);
        setStatus(`Scribe session failed: ${msg.error}`);
      }
      break;
    case "hostPcm":
      feedHostPcm(msg.data);
      break;
    case "hostLog":
      log(`host: ${msg.line}`);
      break;
    case "hostCaptureStatus":
      handleHostCaptureStatus(msg);
      break;
    case "retryMic":
      if (webviewBlocked) post({ type: "hostCaptureStart" });
      else void startMic();
      break;
  }
});

function handleHostCaptureStatus(
  msg: Extract<ExtensionToSpike, { type: "hostCaptureStatus" }>
): void {
  if (msg.state === "running") {
    captureSource = "host";
    updateFab();
    setStatus(`System mic capture active (${msg.backend ?? "unknown"}) — speak freely.`);
    log(`System capture running via ${msg.backend} — no browser permission needed.`);
  } else if (msg.state === "starting") {
    setStatus("Starting system mic capture…");
  } else {
    if (captureSource === "host") captureSource = "none";
    updateFab();
    if (msg.error) {
      log(`System capture stopped: ${msg.error}`);
      setStatus(`System capture failed: ${msg.error}`);
    } else {
      log("System capture stopped.");
      setStatus("Idle — click the mic.");
    }
  }
}

async function openScribeSocket(wsUrl: string, ticket: string, requestId: string): Promise<void> {
  if (captureSource === "none") {
    log("No capture source yet — connect the mic first (Scribe needs audio).");
    setStatus("Start the microphone first.");
    return;
  }
  log(`Connecting WebSocket → ${wsUrl} (request_id=${requestId})`);
  ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";
  dictating = true;
  updateButtons();
  setStatus("Connecting to Addis Scribe…");

  ws.onopen = () => {
    log("WS open — sending session.authenticate (one-use ticket).");
    ws!.send(JSON.stringify({ type: "session.authenticate", token: ticket }));
  };

  ws.onmessage = (ev) => {
    if (typeof ev.data !== "string") return;
    let p: any;
    try {
      p = JSON.parse(ev.data);
    } catch {
      log(`raw event: ${ev.data.slice(0, 300)}`);
      return;
    }
    const t: string = p.type ?? p.event ?? "unknown";
    if (t === "session.created" || t === "session.ready" || t === "authenticated" || t === "session.admitted") {
      scribeReady = true;
      setStatus("Listening — speak Amharic; partials stream below.");
      log(`Admitted (${t}) — streaming 16 kHz PCM16, 100 ms frames.`);
    } else if (t === "transcript.partial") {
      const text: string = p.text ?? p.data?.text ?? "";
      if (text && text !== lastPartial) {
        lastPartial = text;
        showHeard(text, false);
        log(`partial: ${text}`);
      }
    } else if (t === "transcript.completed") {
      const text: string = p.text ?? p.data?.text ?? "";
      const usage = p.usage ?? p.data?.usage;
      log("══ TRANSCRIPT ══");
      log(`HEARD (final): ${text}`);
      showHeard(text, true);
      post({ type: "transcript", requestId, text, usage });
      log(`usage: ${JSON.stringify(usage ?? "(none)")}`);
      finishCleanup();
    } else if (t.includes("error") || t.includes("fail")) {
      log(`Scribe error event: ${ev.data.slice(0, 400)}`);
    } else {
      log(`event: ${ev.data.slice(0, 300)}`);
    }
  };

  ws.onerror = () => log("WebSocket error — see the DevTools console (Help → Toggle Developer Tools).");
  ws.onclose = (ev) => {
    log(`WS closed: code=${ev.code} reason=${ev.reason || "(none)"}`);
    if (dictating) setStatus("Socket closed before a final transcript.");
    finishCleanup();
  };
}

function updateButtons(): void {
  btnScribe.textContent = dictating ? "Stop dictation" : "Connect Scribe";
  btnScribe.disabled = Boolean(ws) && ws!.readyState === WebSocket.CONNECTING;
}

function stopDictation(): void {
  if (!ws) return;
  if (ws.readyState === WebSocket.OPEN && scribeReady) {
    log("Sending audio.finish — waiting for transcript.completed (up to 10 s)…");
    ws.send(JSON.stringify({ type: "audio.finish" }));
    setStatus("Finishing…");
    btnScribe.disabled = true;
    window.clearTimeout(finishTimer);
    finishTimer = window.setTimeout(() => {
      log("Timed out waiting for transcript.completed — forcing close.");
      finishCleanup();
    }, 10000);
  } else {
    finishCleanup();
  }
}

function finishCleanup(): void {
  window.clearTimeout(finishTimer);
  if (ws) {
    ws.onmessage = null;
    ws.onclose = null;
    ws.onerror = null;
    try {
      ws.close();
    } catch {
      /* already closed */
    }
    ws = null;
  }
  scribeReady = false;
  dictating = false;
  lastPartial = "";
  updateButtons();
}

log("Spike webview loaded (Phase 0).");
post({ type: "ready" });
updateFab();
updateButtons();
