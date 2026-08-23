import type { ElementSession, SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isStandardEditable(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    if (el.readOnly || el.disabled) return false;
    const type = (el.type || 'text').toLowerCase();
    const supportedTypes = ['text', 'search', 'url', 'email', 'tel', '', 'password'];
    // Do not transliterate password fields for security
    if (type === 'password') return false;
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
    // Ignore inputs that do not support setSelectionRange
  }

  // Dispatch both InputEvent and generic input/change events for modern frameworks (React, Vue, Angular, Lit)
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

  handleKeyDown(e: KeyboardEvent): boolean {
    const el = e.target as Element;
    if (!isStandardEditable(el)) return false;

    const session = this.sessionManager.getSession(el);

    // Modifier keys check
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if (session.engine.raw.length > 0 && e.key !== 'Shift') {
        session.engine.reset();
      }
      return false;
    }

    if (e.key === 'Escape') {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
        e.preventDefault();
        e.stopPropagation();
        return true;
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
          const prefix = currentValue.slice(0, Math.max(0, start - replaceLen));
          const suffix = currentValue.slice(start);
          const newValue = prefix + state.rendered + suffix;
          const newPos = prefix.length + state.rendered.length;
          applyNativeValue(el, newValue, newPos, newPos);
        } else {
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

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
      }
    }

    return false;
  }
}
