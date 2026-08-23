import type { SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function findContentEditable(target: EventTarget | null): HTMLElement | null {
  if (!target) return null;
  
  let node: Node | null = target as Node;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  
  if (!node || !(node instanceof HTMLElement)) return null;

  if (node.isContentEditable) {
    return (node.closest('[contenteditable="true"]') as HTMLElement) || node;
  }

  const richContainer = node.closest(
    '[contenteditable="true"], [role="textbox"], [role="combobox"], [data-lexical-editor="true"], [data-slate-editor="true"], .ProseMirror, .cm-content, [data-editor]'
  );

  return (richContainer as HTMLElement) || null;
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

  private executeTextMutation(container: HTMLElement, text: string, replaceLength: number): void {
    if (replaceLength > 0) {
      for (let i = 0; i < replaceLength; i++) {
        document.execCommand('delete', false);
      }
    }

    if (text.length > 0) {
      document.execCommand('insertText', false, text);
    }

    try {
      const ev = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: replaceLength > 0 ? 'insertReplacementText' : 'insertText',
        data: text
      });
      container.dispatchEvent(ev);
    } catch {
      container.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  handleKeyDown(e: KeyboardEvent, editableElement: HTMLElement): boolean {
    const session = this.sessionManager.getSession(editableElement);

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

    if (e.key === 'Backspace') {
      if (session.engine.raw.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        const state = session.engine.backspace();

        // When replaceLength is 0 and there is locked output,
        // do not re-insert the locked text (which causes duplication). Just delete 1 char and reset.
        if (state.replaceLength === 0 && state.rendered.length > 0) {
          session.engine.reset();
          document.execCommand('delete', false);
          return true;
        }

        this.executeTextMutation(editableElement, state.rendered, state.replaceLength);
        if (session.engine.raw.length === 0) {
          session.engine.reset();
        }
        return true;
      }
      return false;
    }

    // Printable single character
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (!this.settings.enabled) return false;

      const currentHost = window.location.hostname;
      if (this.settings.disabledDomains?.includes(currentHost)) return false;

      e.preventDefault();
      e.stopPropagation();

      const state = session.engine.feedChar(e.key);
      this.executeTextMutation(editableElement, state.rendered, state.replaceLength);
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
