import { MatchResult, MappingRule } from "./types.js";
import { buildFlatMapping } from "./mapping.js";

export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  ethiopic?: string;
  isEnd: boolean = false;
  output: string | null = null;
}

export class FidelTrie {
  private root: TrieNode = new TrieNode();

  constructor() {
    this.init();
  }

  private init(): void {
    const flatMap = buildFlatMapping();
    for (const [latin, ethiopic] of Object.entries(flatMap)) {
      this.insert(latin, ethiopic);
    }
  }

  public insert(latin: string, ethiopic?: string): void {
    let targetOutput = ethiopic;
    let sequence = latin;

    if (typeof latin === "object" && (latin as unknown as MappingRule).input) {
      sequence = (latin as unknown as MappingRule).input;
      targetOutput = (latin as unknown as MappingRule).output;
    }

    let current = this.root;
    for (let i = 0; i < sequence.length; i++) {
      const char = sequence[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.ethiopic = targetOutput;
    current.output = targetOutput || null;
    current.isEnd = true;
  }

  public search(latin: string): MatchResult {
    if (!latin) {
      return { type: "none" };
    }

    let current = this.root;
    for (let i = 0; i < latin.length; i++) {
      const char = latin[i];
      if (!current.children.has(char)) {
        return { type: "none" };
      }
      current = current.children.get(char)!;
    }

    if (current.isEnd && current.ethiopic) {
      const canContinue = current.children.size > 0;
      return {
        type: "exact",
        output: current.ethiopic,
        matchedLength: latin.length,
        canContinue,
      };
    }

    if (current.children.size > 0) {
      return { type: "prefix" };
    }

    return { type: "none" };
  }

  public findLongestMatch(latin: string): { output: string; matchedLength: number } | null {
    let current = this.root;
    let lastMatch: { output: string; matchedLength: number } | null = null;

    for (let i = 0; i < latin.length; i++) {
      const char = latin[i];
      if (!current.children.has(char)) {
        break;
      }
      current = current.children.get(char)!;
      if (current.isEnd && current.output) {
        lastMatch = {
          output: current.output,
          matchedLength: i + 1,
        };
      }
    }

    return lastMatch;
  }

  public match(input: string, offset = 0) {
    const remaining = input.slice(offset);
    const result = this.findLongestMatch(remaining);
    if (!result) return null;
    return {
      output: result.output,
      consumed: result.matchedLength,
      terminal: false,
    };
  }
}

export const TransliterationTrie = FidelTrie;
