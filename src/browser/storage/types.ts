export interface FidelBrowserSettings {
  enabled: boolean;
  convertPunctuation: boolean;
  convertNumbers: boolean;
  smartCorrection: boolean;
  suggestions: boolean;
  defaultSyllableMerging: 'merge' | 'standalone';
  compositionBoundaryChar: string;
  compositionMergeChar: string;
  dictionary: Record<string, string>;
  disabledDomains: string[];
}

export const DEFAULT_SETTINGS: FidelBrowserSettings = {
  enabled: true,
  convertPunctuation: true,
  convertNumbers: true,
  smartCorrection: true,
  suggestions: true,
  defaultSyllableMerging: 'merge',
  compositionBoundaryChar: '-',
  compositionMergeChar: '+',
  dictionary: {},
  disabledDomains: []
};

export type BrowserMessage =
  | { type: 'GET_STATE' }
  | { type: 'STATE_UPDATE'; state: FidelBrowserSettings }
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'SET_ENABLED'; enabled: boolean }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<FidelBrowserSettings> }
  | { type: 'TRANSLITERATE_TEXT'; text: string }
  | { type: 'PING' };
