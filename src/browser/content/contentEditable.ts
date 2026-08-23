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
    // 1. Delete previous characters if merging into a new syllable
    if (replaceLength > 0) {
      for (let i = 0; i < replaceLength; i++) {
        document.execCommand('delete', false);
      }
    }

    // 2. Insert new text via standard execCommand
    if (text.length > 0) {
      document.execCommand('insertText', false, text);
    }

    // 3. Dispatch synthetic InputEvent for ProseMirror/Lexical/Slate/React reconcilers
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

    if (e.key === 'Escape') {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
      return false;
    }

    if (e.key === 'Backspace') {
      if (session.engine.raw.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        const state = session.engine.backspace();
        this.executeTextMutation(editableElement, state.rendered, state.replaceLength);
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

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      if (session.engine.raw.length > 0) {
        session.engine.reset();
      }
    }

    return false;
  }
}
