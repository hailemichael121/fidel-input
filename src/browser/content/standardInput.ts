import type { ElementSession, SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isStandardEditable(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    if (el.readOnly || el.disabled) return false;
    const type = (el.type || 'text').toLowerCase();
    const supportedTypes = ['text', 'search', 'url', 'email', 'tel', ''];
    return supportedTypes.includes(type);
  }
  return false;
}

export function applyNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  newValue: string,
  newSelectionStart: number,
  newSelectionEnd: number = newSelectionStart
): void {
  const proto = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(el, newValue);
  } else {
    el.value = newValue;
  }

  // Restore caret position
  try {
    el.setSelectionRange(newSelectionStart, newSelectionEnd);
  } catch {
    // Ignore elements that do not support selection ranges
  }

  // Dispatch bubbling InputEvent so React/Vue/Angular update internal state
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertCompositionText'
  });
  el.dispatchEvent(inputEvent);
}

export class StandardInputHandler {
  private sessionManager: SessionManager;
  private settings: FidelBrowserSettings;

  constructor(sessionManager: SessionManager, settings: FidelBrowserSettings) {
    this.sessionManager = sessionManager;
    this.settings = settings;
  }

  updateSettings(settings: FidelBrowserSettings): void {
    this.settings = settings;
  }

  handleKeyDown(e: KeyboardEvent): boolean {
    const el = e.target as Element;
    if (!isStandardEditable(el)) return false;

    const session = this.sessionManager.getSession(el);

    // If modifier keys like Ctrl, Cmd, Alt are pressed (except Shift for uppercase), pass through
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if (session.engine.raw.length > 0 && e.key !== 'Shift') {
        session.engine.reset();
      }
      return false;
    }

    // Escape resets the active composition
    if (e.key === 'Escape') {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
        e.preventDefault();
        return true;
      }
      return false;
    }

    // Handle Backspace within active composition
    if (e.key === 'Backspace') {
      if (session.engine.raw.length > 0) {
        e.preventDefault();
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;

        // If user highlighted text, delete selection natively and reset
        if (start !== end) {
          session.engine.reset();
          const currentValue = el.value;
          const newValue = currentValue.slice(0, start) + currentValue.slice(end);
          applyNativeValue(el, newValue, start, start);
          return true;
        }

        const state = session.engine.backspace();
        const currentValue = el.value;
        const replaceLen = state.replaceLength;

        if (state.rendered.length > 0) {
          // Replace previous output with updated partial syllable
          const prefix = currentValue.slice(0, Math.max(0, start - replaceLen));
          const suffix = currentValue.slice(start);
          const newValue = prefix + state.rendered + suffix;
          const newPos = prefix.length + state.rendered.length;
          applyNativeValue(el, newValue, newPos, newPos);
        } else {
          // Cleared entire composition fragment
          const prefix = currentValue.slice(0, Math.max(0, start - replaceLen));
          const suffix = currentValue.slice(start);
          const newValue = prefix + suffix;
          const newPos = prefix.length;
          applyNativeValue(el, newValue, newPos, newPos);
        }
        return true;
      }
      return false;
    }

    // Handle printable single characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (!this.settings.enabled) return false;

      // Check if current domain is disabled
      const currentHost = window.location.hostname;
      if (this.settings.disabledDomains?.includes(currentHost)) return false;

      e.preventDefault();

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const currentValue = el.value;

      // If user had a highlighted range, replace that range first
      let baseText = currentValue;
      let insertPos = start;
      if (start !== end) {
        session.engine.reset();
        baseText = currentValue.slice(0, start) + currentValue.slice(end);
        insertPos = start;
      }

      const state = session.engine.feedChar(e.key);
      const replaceLen = state.replaceLength;

      const prefix = baseText.slice(0, Math.max(0, insertPos - replaceLen));
      const suffix = baseText.slice(insertPos);
      const newValue = prefix + state.rendered + suffix;
      const newPos = prefix.length + state.rendered.length;

      applyNativeValue(el, newValue, newPos, newPos);
      return true;
    }

    // Navigation keys (Arrow keys, Home, End, PageUp, PageDown) commit/reset composition
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
      }
    }

    return false;
  }
}
