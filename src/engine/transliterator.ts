import {
    COMMON_WORD_MAP,
    PUNCTUATION_MAP,
} from "./mapping.js";

import { FidelTrie } from "./trie.js";
import { convertNumbersInText } from "./numbers.js";

import type {
    FidelOptions,
    TransliterationMatch,
    TransliterationOptions,
} from "./types.js";

import { PersonalDictionary } from "./dictionary.js";
import { SmartCorrector } from "./corrector.js";

const DEFAULT_OPTIONS: Required<TransliterationOptions> = {
    caseSensitive: true,
    convertPunctuation: false,
    convertNumbers: false,
    dictionary: {},
    smartCorrection: false,
    suggestions: false,
    language: "amharic",
};

export class Transliterator {
    private readonly trie = new FidelTrie();
    private readonly options: Required<TransliterationOptions>;
    private readonly dictionary: PersonalDictionary;
    private readonly corrector = new SmartCorrector();

    constructor(options: FidelOptions = {}) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
        this.dictionary = new PersonalDictionary(this.options.dictionary);
    }

    transliterate(input: string): string {
        if (!input) {
            return "";
        }

        // 1. Check personal dictionary first (highest priority)
        const dictMatch = this.dictionary.get(input);
        if (dictMatch) {
            return dictMatch;
        }

        if (this.options.convertNumbers) {
            input = convertNumbersInText(input, true);
        }

        // 2. Check common built-in word overrides
        const commonWord = this.lookupCommonWord(input);
        if (commonWord) {
            return commonWord;
        }

        // 3. Check smart correction candidates against dictionary and common words
        if (this.options.smartCorrection && input.length > 2) {
            const candidates = this.corrector.normalizeInput(input);
            for (const cand of candidates) {
                if (cand !== input) {
                    const dictCand = this.dictionary.get(cand);
                    if (dictCand) return dictCand;

                    const commonCand = this.lookupCommonWord(cand);
                    if (commonCand) return commonCand;
                }
            }
        }

        // 4. Perform standard Trie transliteration
        const output = this.matchTrie(input);

        // 5. Smart correction fallback for non-dictionary candidates (if unparsed Latin characters remain)
        if (this.options.smartCorrection && input.length > 2 && /[a-zA-Z]/.test(output)) {
            const candidates = this.corrector.normalizeInput(input);
            for (const cand of candidates) {
                if (cand !== input) {
                    const candResult = this.matchTrie(cand);
                    if (candResult && candResult !== cand && !/[a-zA-Z]/.test(candResult)) {
                        if (/[a-zA-Z]/.test(output) || output !== candResult) {
                            return candResult;
                        }
                    }
                }
            }
        }

        return output;
    }

    transliterateWord(input: string): string {
        return this.transliterate(input);
    }

    // FIXED: No more infinite recursion!
    transliterateText(text: string, options?: FidelOptions): string {
        // If options are provided, create a new instance with merged options
        if (options) {
            const opts = { ...this.options, ...options };
            const instance = new Transliterator(opts);
            // Use the instance to transliterate each word
            const parts = text.split(/(\s+)/);
            const result = parts.map(part => {
                if (part.trim().length === 0) {
                    return part;
                }
                return instance.transliterate(part);
            }).join('');
            return result;
        }
        
        // Use the current instance
        const parts = text.split(/(\s+)/);
        const result = parts.map(part => {
            if (part.trim().length === 0) {
                return part;
            }
            return this.transliterate(part);
        }).join('');
        return result;
    }

    matchAt(
        input: string,
        offset: number,
    ): TransliterationMatch | null {
        const source = this.options.caseSensitive
            ? input
            : input.toLowerCase();

        return this.findMatch(source, offset);
    }

    private matchTrie(input: string): string {
        const source = this.options.caseSensitive
            ? input
            : input.toLowerCase();

        let output = "";
        let offset = 0;

        while (offset < source.length) {
            // Check multi-character punctuation first if enabled (3-char then 2-char)
            if (this.options.convertPunctuation) {
                if (offset + 3 <= source.length) {
                    const tripleChar = source.slice(offset, offset + 3);
                    if (PUNCTUATION_MAP[tripleChar]) {
                        output += PUNCTUATION_MAP[tripleChar];
                        offset += 3;
                        continue;
                    }
                }
                if (offset + 2 <= source.length) {
                    const doubleChar = source.slice(offset, offset + 2);
                    if (PUNCTUATION_MAP[doubleChar]) {
                        output += PUNCTUATION_MAP[doubleChar];
                        offset += 2;
                        continue;
                    }
                }
            }

            // Check single match in trie
            const match = this.findMatch(source, offset);

            if (match) {
                output += match.output;
                offset += match.consumed;
                continue;
            }

            const character = input[offset];

            if (
                this.options.convertPunctuation &&
                PUNCTUATION_MAP[character]
            ) {
                output += PUNCTUATION_MAP[character];
            } else {
                output += character;
            }

            offset += 1;
        }

        return output;
    }

    private findMatch(
        source: string,
        offset: number,
    ) {
        return this.trie.match(source, offset);
    }

    private lookupCommonWord(input: string): string | null {
        return COMMON_WORD_MAP[input] ?? COMMON_WORD_MAP[input.toLowerCase()] ?? null;
    }
}

export function transliterateWord(
    input: string,
    options: FidelOptions = {},
): string {
    return new Transliterator(options).transliterateWord(input);
}

export function transliterateText(
    input: string,
    options: TransliterationOptions = {},
): string {
    return new Transliterator(options).transliterateText(input, options);
}

export function transliterate(
    input: string,
    options: TransliterationOptions = {},
): string {
    return transliterateText(input, options);
}