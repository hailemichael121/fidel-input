import type { SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isContentEditable(el: Element | null): boolean {
  if (!el) return false;
  if ((el as HTMLElement).isContentEditable) return true;
  const role = el.getAttribute('role');
  if (role === 'textbox' || role === 'combobox') return true;
  return false;
}

export class ContentEditableHandler {
  private sessionManager: SessionManager;
  private settings: FidelBrowserSettings;

  constructor(sessionManager: SessionManager, settings: FidelBrowserSettings) {
    this.sessionManager = sessionManager;
    this.settings = settings;
  }

  updateSettings(settings: FidelBrowserSettings): void {
    this.settings = settings;
  }

  private insertTextViaExecCommand(text: string, replaceLength: number): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // If replaceLength > 0, expand range backward to select characters that need replacement
    if (replaceLength > 0) {
      for (let i = 0; i < replaceLength; i++) {
        sel.modify('extend', 'backward', 'character');
      }
    }

    if (text.length > 0) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('delete', false);
    }
  }

  handleKeyDown(e: KeyboardEvent): boolean {
    const el = e.target as Element;
    if (!isContentEditable(el)) return false;

    const session = this.sessionManager.getSession(el);

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
        return true;
      }
      return false;
    }

    if (e.key === 'Backspace') {
      if (session.engine.raw.length > 0) {
        e.preventDefault();
        const state = session.engine.backspace();
        this.insertTextViaExecCommand(state.rendered, state.replaceLength);
        return true;
      }
      return false;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (!this.settings.enabled) return false;

      const currentHost = window.location.hostname;
      if (this.settings.disabledDomains?.includes(currentHost)) return false;

      e.preventDefault();
      const state = session.engine.feedChar(e.key);
      this.insertTextViaExecCommand(state.rendered, state.replaceLength);
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
