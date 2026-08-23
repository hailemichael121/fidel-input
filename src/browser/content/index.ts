import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { BrowserMessage, FidelBrowserSettings } from '../storage/types';
import { SessionManager } from './sessionManager';
import { isStandardEditable, StandardInputHandler, applyNativeValue } from './standardInput';
import { isContentEditable, ContentEditableHandler } from './contentEditable';

(async function initFidelContentScript() {
  // Avoid double initialization
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

  // Listen for storage updates
  BrowserStorageAdapter.onSettingsChange(updateAllSettings);

  // Listen for runtime background messages
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
      } else if (isContentEditable(active)) {
        document.execCommand('insertText', false, message.text);
      }
    }
  });

  // Global keydown event listener in capture phase
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as Element | null;
    if (!target) return;

    if (isStandardEditable(target)) {
      standardInput.handleKeyDown(e);
    } else if (isContentEditable(target)) {
      contentEditable.handleKeyDown(e);
    }
  }, true);

  // Reset composition session when clicking or blurring
  window.addEventListener('blur', (e: FocusEvent) => {
    const target = e.target as Element | null;
    if (target) sessionManager.resetSession(target);
  }, true);

  window.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (target) sessionManager.resetSession(target);
  }, true);
})();
