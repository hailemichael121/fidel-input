import type { ElementSession, SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isStandardEditable(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    if (el.readOnly || el.disabled) return false;
    const type = (el.type || 'text').toLowerCase();
    if (type === 'password' || type === 'file' || type === 'checkbox' || type === 'radio' || type === 'button' || type === 'submit') return false;
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
  const previousValue = el.value;
  const proto = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(el, newValue);
  } else {
    el.value = newValue;
  }

  // Synchronize React internal tracker so React registers the synthetic change
  const tracker = (el as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
  if (tracker) {
    tracker.setValue(previousValue);
  }

  // Restore caret position before dispatching input event
  try {
    el.setSelectionRange(newSelectionStart, newSelectionEnd);
  } catch {
    // Ignore inputs that do not support setSelectionRange
  }

  // Dispatch standard bubbling InputEvent
  try {
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: newValue.slice(newSelectionStart - 1, newSelectionStart) || undefined
    });
    el.dispatchEvent(inputEvent);
  } catch {
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }
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
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    // Modifier keys check (Ctrl, Cmd, Alt)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if (session.engine.raw.length > 0 && e.key !== 'Shift') {
        session.engine.reset();
      }
      return false;
    }

    // Navigation and submit keys commit/reset composition
    if (['Escape', 'Enter', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
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

        // When replaceLength is 0 (engine has no pending fragment),
        // do not duplicate! Do a single character backspace and reset.
        if (state.replaceLength === 0) {
          session.engine.reset();
          const prefix = currentValue.slice(0, Math.max(0, start - 1));
          const suffix = currentValue.slice(start);
          const newValue = prefix + suffix;
          const newPos = Math.max(0, start - 1);
          applyNativeValue(el, newValue, newPos, newPos);
          return true;
        }

        // Replace pending composition fragment
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
      return false;
    }

    // Handle printable single character
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (!this.settings.enabled) return false;

      const currentHost = window.location.hostname;
      if (this.settings.disabledDomains?.includes(currentHost)) return false;

      e.preventDefault();
      e.stopPropagation();

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

      if (state.committed) {
        session.engine.reset();
      }
      return true;
    }

    return false;
  }
}
