import { CompositionState, FidelOptions } from "./types.js";
import { Transliterator } from "./transliterator.js";

export class CompositionEngine {
  private readonly transliterator: Transliterator;

  private buffer = "";
  private previousRendered = "";

  constructor(options: FidelOptions = {}) {
    this.transliterator = new Transliterator(options);
  }

  public getState(): CompositionState {
    const rendered = this.renderBuffer();

    return {
      buffer: this.buffer,
      rendered,
      committed: false,
      replaceLength: this.previousRendered.length,
      raw: this.buffer,
      output: rendered,
    };
  }

  public state(): { raw: string; output: string } {
    const rendered = this.renderBuffer();

    return {
      raw: this.buffer,
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
        buffer: this.buffer,
        rendered,
        committed: true,
        replaceLength: this.previousRendered.length,
        raw: this.buffer,
        output: rendered,
      };

      this.reset();
      return state;
    }

    if (char.length !== 1) {
      return this.getState();
    }

    // Punctuation delimiters trigger immediate word commit and buffer reset
    if (punctuationBoundary.test(char)) {
      this.buffer += char;
      const rendered = this.renderBuffer();

      const state: CompositionState = {
        buffer: this.buffer,
        rendered,
        committed: true,
        replaceLength: this.previousRendered.length,
        raw: this.buffer,
        output: rendered,
      };

      this.reset();
      return state;
    }

    this.buffer += char;

    const rendered = this.renderBuffer();

    const state: CompositionState = {
      buffer: this.buffer,
      rendered,
      committed: false,
      replaceLength: this.previousRendered.length,
      raw: this.buffer,
      output: rendered,
    };

    this.previousRendered = rendered;

    return state;
  }

  public backspace(): CompositionState {
    if (!this.buffer) {
      return {
        buffer: "",
        rendered: "",
        committed: false,
        replaceLength: 0,
        raw: "",
        output: "",
      };
    }

    const previousLength = this.previousRendered.length;
    const initialRendered = this.previousRendered;

    while (this.buffer.length > 0) {
      this.buffer = this.buffer.slice(0, -1);
      const newRendered = this.renderBuffer();
      if (newRendered !== initialRendered || this.buffer.length === 0) {
        this.previousRendered = newRendered;
        return {
          buffer: this.buffer,
          rendered: newRendered,
          committed: false,
          replaceLength: previousLength,
          raw: this.buffer,
          output: newRendered,
        };
      }
    }

    this.previousRendered = "";
    return {
      buffer: "",
      rendered: "",
      committed: false,
      replaceLength: previousLength,
      raw: "",
      output: "",
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
    this.buffer = "";
    this.previousRendered = "";
  }

  get raw(): string {
    return this.buffer;
  }

  get output(): string {
    return this.renderBuffer();
  }

  /**
   * Render the current composition buffer dynamically.
   */
  private renderBuffer(): string {
    return this.transliterator.transliterateText(this.buffer);
  }
}
