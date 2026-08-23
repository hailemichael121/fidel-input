import type { SessionManager } from './sessionManager';
import type { FidelBrowserSettings } from '../storage/types';

export function isGoogleDocs(): boolean {
  return window.location.hostname === 'docs.google.com' ||
         (window.location.hostname.endsWith('.google.com') && window.location.pathname.includes('/document/'));
}

export function isGoogleSheets(): boolean {
  return window.location.hostname === 'docs.google.com' && window.location.pathname.includes('/spreadsheets/');
}

export function isGoogleSlides(): boolean {
  return window.location.hostname === 'docs.google.com' && window.location.pathname.includes('/presentation/');
}

export function getGoogleDocsTarget(): HTMLElement | null {
  const iframe = document.querySelector('iframe.docs-texteventtarget-iframe') as HTMLIFrameElement;
  if (iframe && iframe.contentDocument) {
    const el = (iframe.contentDocument.querySelector('[contenteditable="true"], textarea, body') as HTMLElement) || iframe.contentDocument.body;
    return el;
  }
  return null;
}

/**
 * Universal Editable Element Resolver
 * Supports Google Docs/Sheets/Slides/Gmail, Claude, ChatGPT, Gemini, Notion, Slack,
 * MS Office 365, Discord, WhatsApp, Telegram, Lexical, ProseMirror, Slate, Quill, CKEditor, TinyMCE, etc.
 */
export function findContentEditable(target: EventTarget | null): HTMLElement | null {
  if (!target) return null;
  
  let node: Node | null = target as Node;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  
  if (!node || !(node instanceof HTMLElement)) return null;

  // 1. Google Docs Canvas & Text Event Receiver Iframe
  if (node.classList.contains('docs-texteventtarget-iframe') || 
      node.closest('.docs-texteventtarget-iframe') ||
      node.closest('.kix-appview-editor, .kix-canvas-tile-content, [class*="docs-texteventtarget"]')) {
    const docsTarget = getGoogleDocsTarget();
    if (docsTarget) return docsTarget;
    if (node.isContentEditable) return node;
    return node;
  }

  // 2. Google Sheets Formula Bar & Cell Editor
  if (node.closest('#waffle-rich-text-editor, .cell-input, #formula-bar-text-editor, #formula-bar')) {
    return (node.closest('#waffle-rich-text-editor, .cell-input, #formula-bar-text-editor, #formula-bar') as HTMLElement) || node;
  }

  // 3. Direct ContentEditable (or plaintext-only)
  if (node.isContentEditable) {
    return (node.closest('[contenteditable="true"], [contenteditable="plaintext-only"]') as HTMLElement) || node;
  }

  // 4. Modern Rich Text Frameworks & Portals (Claude, ChatGPT, Gemini, Notion, Slack, Discord, MS Teams, etc.)
  const richContainer = node.closest(
    [
      // Standards & Roles
      '[contenteditable="true"]',
      '[contenteditable="plaintext-only"]',
      '[role="textbox"]',
      '[role="combobox"]',
      '[role="searchbox"]',

      // Google Ecosystem (Gmail, Chat, Keep)
      '[g_editable="true"]',
      '[aria-label="Message Body"]',
      '[aria-label*="Reply"]',
      '[aria-label*="Chat"]',
      '.editable',
      '.kix-appview-editor',
      '.docs-texteventtarget-iframe',
      '#waffle-rich-text-editor',
      '.sketchy-text-editor-container',

      // AI Platforms (Claude, ChatGPT, Gemini, Perplexity)
      '.ProseMirror',
      '#prompt-textarea',
      'rich-textarea',
      '[data-placeholder]',

      // Productivity & Chat (Notion, Slack, Discord, Telegram, WhatsApp, Teams)
      '[data-content-editable-root]',
      '[data-block-id]',
      '.notion-page-content',
      '.ql-editor',
      '[data-qa="message_input"]',
      '[data-qa="message_editor"]',
      '[data-slate-editor="true"]',
      '[data-slate-node]',
      '[data-lexical-editor="true"]',
      '.DraftEditor-root',
      '[data-contents="true"]',
      '.input-message-input',
      '[data-tab="10"]',
      '.ck-content',
      '.tox-edit-area',
      '.cm-content',
      '[data-editor]'
    ].join(', ')
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

    // Dispatch synthetic InputEvents to notify modern frameworks (ProseMirror, Lexical, Slate, Notion)
    try {
      const inputEv = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: text.length > 0 ? 'insertText' : 'deleteContentBackward',
        data: text || undefined
      });
      container.dispatchEvent(inputEv);
    } catch {
      container.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
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
