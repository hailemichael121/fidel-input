import { BrowserStorageAdapter } from '../storage/storageAdapter';
import { DEFAULT_SETTINGS, type BrowserMessage, type FidelBrowserSettings } from '../storage/types';
import { SessionManager } from './sessionManager';
import { isStandardEditable, StandardInputHandler, applyNativeValue } from './standardInput';
import { findContentEditable, ContentEditableHandler, isGoogleDocs, getGoogleDocsTarget } from './contentEditable';

function extensionId(): string | null {
  try {
    return chrome.runtime?.id ?? null;
  } catch {
    return null;
  }
}

(function initFidelContentScript() {
  const runtimeId = extensionId();
  if (!runtimeId) return;

  const root = window as unknown as { __FIDEL_RUNTIME_ID__?: string };
  if (root.__FIDEL_RUNTIME_ID__ === runtimeId) return;
  root.__FIDEL_RUNTIME_ID__ = runtimeId;

  let settings: FidelBrowserSettings = { ...DEFAULT_SETTINGS };
  const sessionManager = new SessionManager(settings);
  const standardInput = new StandardInputHandler(sessionManager, settings);
  const contentEditable = new ContentEditableHandler(sessionManager, settings);

  function updateAllSettings(newSettings: FidelBrowserSettings) {
    settings = newSettings;
    sessionManager.updateSettings(newSettings);
    standardInput.updateSettings(newSettings);
    contentEditable.updateSettings(newSettings);
  }

  function refreshSettings() {
    BrowserStorageAdapter.getSettings().then(updateAllSettings).catch(() => undefined);
  }

  refreshSettings();
  BrowserStorageAdapter.onSettingsChange(updateAllSettings);

  chrome.runtime.onMessage.addListener((message: BrowserMessage, _sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ ok: true });
      return;
    }
    if (message.type === 'STATE_UPDATE') {
      updateAllSettings(message.state);
    } else if (message.type === 'TRANSLITERATE_TEXT') {
      const active = getDeepActiveElement();
      if (isStandardEditable(active)) {
        const start = active.selectionStart ?? 0;
        const end = active.selectionEnd ?? 0;
        const cur = active.value;
        const updated = cur.slice(0, start) + message.text + cur.slice(end);
        const newPos = start + message.text.length;
        applyNativeValue(active, updated, newPos, newPos);
      } else {
        const rich = findContentEditable(active) || (isGoogleDocs() ? getGoogleDocsTarget() : null);
        if (rich) {
          const doc = rich.ownerDocument || document;
          doc.execCommand('insertText', false, message.text);
        }
      }
    }
  });

  function keepAlive() {
    try {
      chrome.runtime.sendMessage({ type: 'PING' }, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // Background is waking or context is restarting
    }
  }

  keepAlive();
  window.setInterval(keepAlive, 20000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      keepAlive();
      refreshSettings();
    }
  }, true);

  window.addEventListener('pageshow', () => {
    keepAlive();
    refreshSettings();
  });

  window.addEventListener('focus', () => {
    keepAlive();
    refreshSettings();
  });

  function getDeepActiveElement(): Element | null {
    let active = document.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  function getEventTarget(e: Event): Element | null {
    const path = e.composedPath ? e.composedPath() : [];
    for (const item of path) {
      if (item instanceof Element) {
        if (isStandardEditable(item) || findContentEditable(item)) {
          return item;
        }
      }
    }
    if (path.length > 0 && path[0] instanceof Element) {
      return path[0];
    }
    if (e.target instanceof Element) {
      return e.target;
    }
    return getDeepActiveElement();
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.altKey && (e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) ||
        (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))) {
      e.preventDefault();
      e.stopPropagation();
      try {
        chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' }, (updated) => {
          if (updated) updateAllSettings(updated);
        });
      } catch {
        // Background waking
      }
      return;
    }

    const rawTarget = getEventTarget(e);
    if (!rawTarget) return;

    let target = rawTarget;
    if (!isStandardEditable(target) && !findContentEditable(target)) {
      if (isGoogleDocs()) {
        const docsTarget = getGoogleDocsTarget();
        if (docsTarget) {
          target = docsTarget;
        }
      } else {
        const deepActive = getDeepActiveElement();
        if (deepActive && (isStandardEditable(deepActive) || findContentEditable(deepActive))) {
          target = deepActive;
        }
      }
    }

    if (isStandardEditable(target)) {
      standardInput.handleKeyDown(e, target);
    } else {
      const richContainer = findContentEditable(target) || (isGoogleDocs() ? getGoogleDocsTarget() : null);
      if (richContainer) {
        contentEditable.handleKeyDown(e, richContainer);
      }
    }
  }

  window.addEventListener('keydown', onKeyDown, true);

  window.addEventListener('blur', (e: FocusEvent) => {
    const target = getEventTarget(e);
    if (target) sessionManager.resetSession(target);
  }, true);

  window.addEventListener('click', (e: MouseEvent) => {
    const target = getEventTarget(e);
    if (target) sessionManager.resetSession(target);
  }, true);
})();
