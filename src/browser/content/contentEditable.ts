import type { SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isGoogleDocs(): boolean {
  return window.location.hostname === 'docs.google.com' ||
         (window.location.hostname.endsWith('.google.com') && window.location.pathname.includes('/document/'));
}

export function getGoogleDocsTarget(): HTMLElement | null {
  const iframe = document.querySelector('iframe.docs-texteventtarget-iframe') as HTMLIFrameElement;
  if (iframe && iframe.contentDocument) {
    const el = (iframe.contentDocument.querySelector('[contenteditable="true"], textarea, body') as HTMLElement) || iframe.contentDocument.body;
    return el;
  }
  return null;
}

export function findContentEditable(target: EventTarget | null): HTMLElement | null {
  if (!target) return null;
  
  let node: Node | null = target as Node;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  
  if (!node || !(node instanceof HTMLElement)) return null;

  // Google Docs Support: match iframe or internal canvas container
  if (node.classList.contains('docs-texteventtarget-iframe') || 
      node.closest('.docs-texteventtarget-iframe') ||
      node.closest('.kix-appview-editor, .kix-canvas-tile-content, [class*="docs-texteventtarget"]')) {
    const docsTarget = getGoogleDocsTarget();
    if (docsTarget) return docsTarget;
    if (node.isContentEditable) return node;
    return node;
  }

  if (node.isContentEditable) {
    return (node.closest('[contenteditable="true"]') as HTMLElement) || node;
  }

  const richContainer = node.closest(
    '[contenteditable="true"], [role="textbox"], [role="combobox"], [data-lexical-editor="true"], [data-slate-editor="true"], .ProseMirror, .cm-content, [data-editor], .kix-appview-editor, .docs-texteventtarget-iframe'
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

  private executeAtomicMutation(container: HTMLElement, text: string, replaceLength: number): void {
    const doc = container.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection();

    if (!sel || sel.rangeCount === 0) {
      if (text.length > 0) doc.execCommand('insertText', false, text);
      return;
    }

    // Select backward replaceLength characters atomically
    if (replaceLength > 0) {
      for (let i = 0; i < replaceLength; i++) {
        sel.modify('extend', 'backward', 'character');
      }
    }

    // Replace selected range cleanly in one atomic transaction
    if (text.length > 0) {
      doc.execCommand('insertText', false, text);
    } else if (replaceLength > 0) {
      doc.execCommand('delete', false);
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

    if (['Escape', 'Enter', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
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

        if (state.replaceLength === 0) {
          session.engine.reset();
          const doc = editableElement.ownerDocument || document;
          doc.execCommand('delete', false);
          return true;
        }

        this.executeAtomicMutation(editableElement, state.rendered, state.replaceLength);

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
      this.executeAtomicMutation(editableElement, state.rendered, state.replaceLength);

      if (state.committed) {
        session.engine.reset();
      }
      return true;
    }

    return false;
  }
}
