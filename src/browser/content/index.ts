import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { BrowserMessage, FidelBrowserSettings } from '../storage/types';
import { SessionManager } from './sessionManager';
import { isStandardEditable, StandardInputHandler, applyNativeValue } from './standardInput';
import { findContentEditable, ContentEditableHandler } from './contentEditable';

(async function initFidelContentScript() {
  if ((window as unknown as { __FIDEL_LOADED__?: boolean }).__FIDEL_LOADED__) return;
  (window as unknown as { __FIDEL_LOADED__?: boolean }).__FIDEL_LOADED__ = true;

  let settings = await BrowserStorageAdapter.getSettings();
  const sessionManager = new SessionManager(settings);
  const standardInput = new StandardInputHandler(sessionManager, settings);
  const contentEditable = new ContentEditableHandler(sessionManager, settings);

  function updateAllSettings(newSettings: FidelBrowserSettings) {
    settings = newSettings;
    sessionManager.updateSettings(newSettings);
    standardInput.updateSettings(newSettings);
    contentEditable.updateSettings(newSettings);
  }

  BrowserStorageAdapter.onSettingsChange(updateAllSettings);

  chrome.runtime.onMessage.addListener((message: BrowserMessage) => {
    if (message.type === 'STATE_UPDATE') {
      updateAllSettings(message.state);
    } else if (message.type === 'TRANSLITERATE_TEXT') {
      const active = document.activeElement;
      if (isStandardEditable(active)) {
        const start = active.selectionStart ?? 0;
        const end = active.selectionEnd ?? 0;
        const cur = active.value;
        const updated = cur.slice(0, start) + message.text + cur.slice(end);
        const newPos = start + message.text.length;
        applyNativeValue(active, updated, newPos, newPos);
      } else {
        const rich = findContentEditable(active);
        if (rich) {
          document.execCommand('insertText', false, message.text);
        }
      }
    }
  });

  function getEventTarget(e: Event): Element | null {
    const path = e.composedPath ? e.composedPath() : [];
    if (path.length > 0 && path[0] instanceof Element) {
      return path[0];
    }
    if (e.target instanceof Element) {
      return e.target;
    }
    return document.activeElement;
  }

  // Global keydown event listener in capture phase
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // 1. In-page shortcut fallback for Alt+Shift+A or Alt+A to toggle Fidel input mode
    if ((e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'TOGGLE_ENABLED' }, (updated) => {
        if (updated) updateAllSettings(updated);
      });
      return;
    }

    const rawTarget = getEventTarget(e);
    if (!rawTarget) return;

    // Resolve target element (handling Google Search auto-focus and active element)
    let target = rawTarget;
    if (!isStandardEditable(target) && !findContentEditable(target) && document.activeElement) {
      if (isStandardEditable(document.activeElement) || findContentEditable(document.activeElement)) {
        target = document.activeElement;
      }
    }

    if (isStandardEditable(target)) {
      standardInput.handleKeyDown(e, target);
    } else {
      const richContainer = findContentEditable(target);
      if (richContainer) {
        contentEditable.handleKeyDown(e, richContainer);
      }
    }
  }, true);

  // Reset composition session when clicking or blurring
  window.addEventListener('blur', (e: FocusEvent) => {
    const target = getEventTarget(e);
    if (target) sessionManager.resetSession(target);
  }, true);

  window.addEventListener('click', (e: MouseEvent) => {
    const target = getEventTarget(e);
    if (target) sessionManager.resetSession(target);
  }, true);
})();
