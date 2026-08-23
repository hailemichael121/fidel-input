import type { ElementSession, SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isStandardEditable(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    if (el.readOnly || el.disabled) return false;
    const type = (el.type || 'text').toLowerCase();
    // Do not transliterate password or file inputs for safety
    if (type === 'password' || type === 'file' || type === 'checkbox' || type === 'radio') return false;
    return true;
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
    // Ignore inputs that do not support setSelectionRange
  }

  // Dispatch comprehensive events for Google Search, React, Vue, Angular, Lit
  try {
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: newValue
    });
    el.dispatchEvent(inputEvent);
  } catch {
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }

  el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
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

  handleKeyDown(e: KeyboardEvent, targetElement?: Element): boolean {
    const el = (targetElement || e.target) as Element;
    if (!isStandardEditable(el)) return false;

    const session = this.sessionManager.getSession(el);

    // Modifier keys check
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if (session.engine.raw.length > 0 && e.key !== 'Shift') {
        session.engine.reset();
      }
      return false;
    }

    if (e.key === 'Escape' || e.key === 'Enter') {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
      }
      return false;
    }

    // Handle Backspace within active composition
    if (e.key === 'Backspace') {
      if (session.engine.raw.length > 0) {
        e.preventDefault();
        e.stopPropagation();
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

        // When replaceLength is 0 and there is locked output,
        // re-inserting would duplicate characters. Perform normal 1-char backspace and reset.
        if (state.replaceLength === 0 && state.rendered.length > 0) {
          const prefix = currentValue.slice(0, Math.max(0, start - 1));
          const suffix = currentValue.slice(start);
          const newValue = prefix + suffix;
          const newPos = Math.max(0, start - 1);
          session.engine.reset();
          applyNativeValue(el, newValue, newPos, newPos);
          return true;
        }

        if (state.replaceLength > 0) {
          const prefix = currentValue.slice(0, Math.max(0, start - state.replaceLength));
          const suffix = currentValue.slice(start);
          const newValue = prefix + state.rendered + suffix;
          const newPos = prefix.length + state.rendered.length;
          applyNativeValue(el, newValue, newPos, newPos);
          if (session.engine.raw.length === 0) {
            session.engine.reset();
          }
          return true;
        }

        // Buffer cleared
        session.engine.reset();
        const prefix = currentValue.slice(0, Math.max(0, start - 1));
        const suffix = currentValue.slice(start);
        const newValue = prefix + suffix;
        const newPos = Math.max(0, start - 1);
        applyNativeValue(el, newValue, newPos, newPos);
        return true;
      }
      return false;
    }

    // Handle printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (!this.settings.enabled) return false;

      const currentHost = window.location.hostname;
      if (this.settings.disabledDomains?.includes(currentHost)) return false;

      e.preventDefault();
      e.stopPropagation();

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const currentValue = el.value;

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

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(e.key)) {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
      }
    }

    return false;
  }
}
