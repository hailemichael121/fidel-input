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

        // 3. Perform standard Trie transliteration first
        const source = this.options.caseSensitive
            ? input
            : input.toLowerCase();

        let output = "";
        let offset = 0;

        while (offset < source.length) {
            // Check 2-character punctuation first if enabled
            if (this.options.convertPunctuation && offset + 1 < source.length) {
                const doubleChar = source.slice(offset, offset + 2);
                if (PUNCTUATION_MAP[doubleChar]) {
                    output += PUNCTUATION_MAP[doubleChar];
                    offset += 2;
                    continue;
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

        // 4. Try smart correction ONLY if output still contains unconverted Latin characters
        if (this.options.smartCorrection && input.length > 2 && /[a-zA-Z]/.test(output)) {
            const candidates = this.corrector.normalizeInput(input);
            for (const cand of candidates) {
                if (cand !== input) {
                    const dictCand = this.dictionary.get(cand);
                    if (dictCand) return dictCand;
                    const commonCand = this.lookupCommonWord(cand);
                    if (commonCand) return commonCand;
                    const candResult = new Transliterator({ ...this.options, smartCorrection: false }).transliterate(cand);
                    if (candResult && candResult !== cand && !/[a-zA-Z]/.test(candResult)) {
                        return candResult;
                    }
                }
            }
        }

        return output;
    }

    transliterateWord(input: string): string {
        return this.transliterate(input);
    }

    transliterateText(text: string, options?: FidelOptions): string {
        const opts = { ...this.options, ...options };
        return new Transliterator(opts).transliterateText(text, options);
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
