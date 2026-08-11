import {
    COMMON_WORD_MAP,
    PUNCTUATION_MAP,
} from "./mapping.js";

import { FidelTrie } from "./trie.js";

import type {
    FidelOptions,
    TransliterationMatch,
    TransliterationOptions,
} from "./types.js";

const DEFAULT_OPTIONS: Required<TransliterationOptions> = {
    caseSensitive: true,
    convertPunctuation: false,
    convertNumbers: false,
};

export class Transliterator {
    private readonly trie = new FidelTrie();
    private readonly options: Required<TransliterationOptions>;

    constructor(options: FidelOptions = {}) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
    }

    transliterate(input: string): string {
        if (!input) {
            return "";
        }

        const commonWord = this.lookupCommonWord(input);
        if (commonWord) {
            return commonWord;
        }

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

        return output;
    }

    transliterateWord(input: string): string {
        return this.transliterate(input);
    }

    transliterateText(text: string, options?: FidelOptions): string {
        if (options && typeof options.convertPunctuation !== "undefined") {
            return new Transliterator(options).transliterate(text);
        }
        return this.transliterate(text);
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
        const key = this.options.caseSensitive
            ? input
            : input.toLowerCase();

        return COMMON_WORD_MAP[key] ?? null;
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
