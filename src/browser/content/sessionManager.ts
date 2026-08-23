import { CompositionEngine } from '../../engine/composition';
import type { FidelBrowserSettings } from '../storage/types';

export interface ElementSession {
  engine: CompositionEngine;
  lastSelectionStart: number | null;
  lastSelectionEnd: number | null;
}

export class SessionManager {
  private sessions = new WeakMap<Element, ElementSession>();
  private settings: FidelBrowserSettings;

  constructor(settings: FidelBrowserSettings) {
    this.settings = settings;
  }

  updateSettings(settings: FidelBrowserSettings): void {
    this.settings = settings;
  }

  getSession(element: Element): ElementSession {
    let session = this.sessions.get(element);
    if (!session) {
      session = {
        engine: new CompositionEngine({
          convertPunctuation: this.settings.convertPunctuation,
          convertNumbers: this.settings.convertNumbers,
          defaultSyllableMerging: this.settings.defaultSyllableMerging,
          compositionBoundaryChar: this.settings.compositionBoundaryChar,
          compositionMergeChar: this.settings.compositionMergeChar,
          dictionary: this.settings.dictionary
        }),
        lastSelectionStart: null,
        lastSelectionEnd: null
      };
      this.sessions.set(element, session);
    }
    return session;
  }

  hasActiveComposition(element: Element): boolean {
    const session = this.sessions.get(element);
    return !!session && session.engine.raw.length > 0;
  }

  resetSession(element: Element): void {
    const session = this.sessions.get(element);
    if (session) {
      session.engine.reset();
      session.lastSelectionStart = null;
      session.lastSelectionEnd = null;
    }
  }
}
