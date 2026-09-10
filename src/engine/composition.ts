import { CompositionOptions, CompositionState, AmbiguousSpan, SyllableMergeMode } from "./types.js";
import { Transliterator } from "./transliterator.js";
import { FidelTrie } from "./trie.js";

export class CompositionEngine {
  private readonly transliterator: Transliterator;
  private readonly trie: FidelTrie;
  private readonly defaultSyllableMerging: SyllableMergeMode;
  private readonly boundaryChar: string;
  private readonly mergeChar: string;
  private readonly maxKeyLength: number;

  private lockedOutput = "";
  private lockedRaw = "";
  private pendingFragment = "";
  private forceNextMerge = false;
  private previousRendered = "";
  private ambiguousSpans: AmbiguousSpan[] = [];

  constructor(options: CompositionOptions = {}) {
    this.transliterator = new Transliterator(options);
    this.trie = new FidelTrie();
    this.defaultSyllableMerging = options.defaultSyllableMerging ?? "merge";
    this.boundaryChar = options.compositionBoundaryChar ?? "-";
    this.mergeChar = options.compositionMergeChar ?? "+";
    this.maxKeyLength = 8;
  }

  public getState(): CompositionState {
    const rendered = this.renderBuffer();

    return {
      buffer: this.lockedRaw + this.pendingFragment,
      rendered,
      committed: false,
      replaceLength: this.previousRendered.length,
      raw: this.lockedRaw + this.pendingFragment,
      output: rendered,
      lockedOutput: this.lockedOutput,
      pendingFragment: this.pendingFragment,
      ambiguousSpans: [...this.ambiguousSpans],
    };
  }

  public state(): { raw: string; output: string } {
    const rendered = this.renderBuffer();

    return {
      raw: this.lockedRaw + this.pendingFragment,
      output: rendered,
    };
  }

  public input(char: string): { raw: string; output: string } {
    this.feedChar(char);
    return this.state();
  }

  public feedChar(char: string): CompositionState {
    const whitespaceBoundary = /[\s\r\n\t]/;
    const punctuationBoundary = /[.,!?;:@*#~_|><]/;

    // Whitespace / newlines trigger immediate session boundary commit
    if (whitespaceBoundary.test(char)) {
      const rendered = this.renderBuffer() + char;

      const state: CompositionState = {
        buffer: this.lockedRaw + this.pendingFragment,
        rendered,
        committed: true,
        replaceLength: this.previousRendered.length,
        raw: this.lockedRaw + this.pendingFragment,
        output: rendered,
        lockedOutput: this.lockedOutput,
        pendingFragment: this.pendingFragment,
        ambiguousSpans: [...this.ambiguousSpans],
      };

      this.reset();
      return state;
    }

    if (char.length !== 1) {
      return this.getState();
    }

    // Punctuation delimiters trigger immediate word commit and buffer reset
    if (punctuationBoundary.test(char)) {
      const pendingRendered = this.renderPendingFragment(this.pendingFragment + char);
      const rendered = this.lockedOutput + pendingRendered;

      const state: CompositionState = {
        buffer: this.lockedRaw + this.pendingFragment + char,
        rendered,
        committed: true,
        replaceLength: this.previousRendered.length,
        raw: this.lockedRaw + this.pendingFragment + char,
        output: rendered,
        lockedOutput: this.lockedOutput,
        pendingFragment: this.pendingFragment,
        ambiguousSpans: [...this.ambiguousSpans],
      };

      this.reset();
      return state;
    }

    // Explicit syllable boundary character (consumed, not inserted)
    if (this.boundaryChar && char === this.boundaryChar) {
      if (this.pendingFragment.length > 0) {
        this.commitPendingMatches("");
      }
      this.forceNextMerge = false;
      const rendered = this.renderBuffer();
      const state: CompositionState = {
        buffer: this.lockedRaw,
        rendered,
        committed: false,
        replaceLength: this.previousRendered.length,
        raw: this.lockedRaw,
        output: rendered,
        lockedOutput: this.lockedOutput,
        pendingFragment: "",
        ambiguousSpans: [...this.ambiguousSpans],
      };
      this.previousRendered = rendered;
      return state;
    }

    // Explicit syllable merge character (consumed, not inserted)
    if (this.mergeChar && char === this.mergeChar) {
      this.forceNextMerge = true;
      const rendered = this.renderBuffer();
      const state: CompositionState = {
        buffer: this.lockedRaw + this.pendingFragment,
        rendered,
        committed: false,
        replaceLength: this.previousRendered.length,
        raw: this.lockedRaw + this.pendingFragment,
        output: rendered,
        lockedOutput: this.lockedOutput,
        pendingFragment: this.pendingFragment,
        ambiguousSpans: [...this.ambiguousSpans],
      };
      this.previousRendered = rendered;
      return state;
    }

    // Regular character handling
    if (!this.pendingFragment) {
      this.pendingFragment = char;
    } else {
      const candidate = this.pendingFragment + char;
      const currentSearch = this.trie.search(this.pendingFragment);
      const candSearch = this.trie.search(candidate);
      const canExtend = candSearch.type === "exact" || candSearch.type === "prefix";

      const isCurrentAmbiguous = currentSearch.type === "exact" && currentSearch.canContinue;

      if (isCurrentAmbiguous && canExtend && this.defaultSyllableMerging === "standalone" && !this.forceNextMerge) {
        // Under standalone mode: commit current complete match, start new pending fragment
        const lockedSyl = this.renderPendingFragment(this.pendingFragment);
        const startOffset = this.lockedOutput.length;
        this.lockedOutput += lockedSyl;
        this.lockedRaw += this.pendingFragment;
        this.pendingFragment = char;

        const chosen = lockedSyl + this.renderPendingFragment(char);
        const alternate = candSearch.output ?? this.renderPendingFragment(candidate);
        this.ambiguousSpans.push({
          chosen,
          alternate,
          startOffset,
          endOffset: startOffset + chosen.length,
          raw: candidate,
        });
      } else if (canExtend && (this.defaultSyllableMerging === "merge" || this.forceNextMerge || currentSearch.type === "prefix")) {
        // Extend pending fragment
        if (isCurrentAmbiguous && candSearch.type === "exact") {
          const startOffset = this.lockedOutput.length;
          const chosen = candSearch.output ?? this.renderPendingFragment(candidate);
          const alternate = (currentSearch.output ?? "") + this.renderPendingFragment(char);
          this.ambiguousSpans.push({
            chosen,
            alternate,
            startOffset,
            endOffset: startOffset + chosen.length,
            raw: candidate,
          });
        }
        this.pendingFragment = candidate;
        this.forceNextMerge = false;
      } else {
        // Cannot extend: commit pending matches to lockedOutput, start new fragment
        this.commitPendingMatches(char);
        this.forceNextMerge = false;
      }

      // Bound pendingFragment length defensively
      if (this.pendingFragment.length > this.maxKeyLength) {
        this.commitPendingMatches("");
      }
    }

    const rendered = this.renderBuffer();

    const state: CompositionState = {
      buffer: this.lockedRaw + this.pendingFragment,
      rendered,
      committed: false,
      replaceLength: this.previousRendered.length,
      raw: this.lockedRaw + this.pendingFragment,
      output: rendered,
      lockedOutput: this.lockedOutput,
      pendingFragment: this.pendingFragment,
      ambiguousSpans: [...this.ambiguousSpans],
    };

    this.previousRendered = rendered;

    return state;
  }

  public backspace(): CompositionState {
    if (!this.pendingFragment && !this.lockedOutput) {
      return {
        buffer: "",
        rendered: "",
        committed: false,
        replaceLength: 0,
        raw: "",
        output: "",
        lockedOutput: "",
        pendingFragment: "",
        ambiguousSpans: [],
      };
    }

    const previousLength = this.previousRendered.length;

    if (this.pendingFragment.length > 0) {
      this.pendingFragment = this.pendingFragment.slice(0, -1);
      const newRendered = this.renderBuffer();
      this.previousRendered = newRendered;
      return {
        buffer: this.lockedRaw + this.pendingFragment,
        rendered: newRendered,
        committed: false,
        replaceLength: previousLength,
        raw: this.lockedRaw + this.pendingFragment,
        output: newRendered,
        lockedOutput: this.lockedOutput,
        pendingFragment: this.pendingFragment,
        ambiguousSpans: [...this.ambiguousSpans],
      };
    }

    // Pending fragment is already empty: do not mutate lockedOutput
    this.previousRendered = this.lockedOutput;
    return {
      buffer: this.lockedRaw,
      rendered: this.lockedOutput,
      committed: false,
      replaceLength: 0,
      raw: this.lockedRaw,
      output: this.lockedOutput,
      lockedOutput: this.lockedOutput,
      pendingFragment: "",
      ambiguousSpans: [...this.ambiguousSpans],
    };
  }

  public commit(): { raw: string; output: string } {
    const state = this.state();
    this.reset();
    return state;
  }

  public commitComposition(): CompositionState {
    const state = this.getState();
    this.reset();
    return state;
  }

  public reset(): void {
    this.lockedOutput = "";
    this.lockedRaw = "";
    this.pendingFragment = "";
    this.forceNextMerge = false;
    this.previousRendered = "";
    this.ambiguousSpans = [];
  }

  get raw(): string {
    return this.lockedRaw + this.pendingFragment;
  }

  get output(): string {
    return this.renderBuffer();
  }

  get locked(): string {
    return this.lockedOutput;
  }

  get pending(): string {
    return this.pendingFragment;
  }

  get ambiguities(): AmbiguousSpan[] {
    return [...this.ambiguousSpans];
  }

  private commitPendingMatches(newChar: string): void {
    let fragment = this.pendingFragment;
    while (fragment.length > 0) {
      const match = this.trie.findLongestMatch(fragment);
      if (match && match.matchedLength > 0) {
        this.lockedOutput += match.output;
        this.lockedRaw += fragment.slice(0, match.matchedLength);
        fragment = fragment.slice(match.matchedLength);
      } else {
        const charToLock = fragment[0];
        const rendered = this.renderPendingFragment(charToLock);
        this.lockedOutput += rendered;
        this.lockedRaw += charToLock;
        fragment = fragment.slice(1);
      }
    }
    this.pendingFragment = newChar;
  }

  private renderPendingFragment(fragment: string): string {
    if (!fragment) return "";
    return this.transliterator.transliterateWord(fragment);
  }

  private renderBuffer(): string {
    return this.lockedOutput + this.renderPendingFragment(this.pendingFragment);
  }
}
