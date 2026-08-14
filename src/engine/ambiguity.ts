import { AmbiguousSpan } from "./types.js";

export interface DocPosition {
  line: number;
  character: number;
}

export interface DocRange {
  start: DocPosition;
  end: DocPosition;
}

export interface TrackedAmbiguitySpan {
  id: string;
  documentUri: string;
  range: DocRange;
  chosen: string;
  alternate: string;
  raw: string;
}

export class AmbiguitySpanTracker {
  private spansByDoc: Map<string, TrackedAmbiguitySpan[]> = new Map();
  private maxSpansPerDoc = 50;

  public addSpans(
    documentUri: string,
    wordStartPos: DocPosition,
    ambiguousSpans: AmbiguousSpan[]
  ): void {
    if (!ambiguousSpans || ambiguousSpans.length === 0) return;

    let docSpans = this.spansByDoc.get(documentUri);
    if (!docSpans) {
      docSpans = [];
      this.spansByDoc.set(documentUri, docSpans);
    }

    for (const span of ambiguousSpans) {
      const start: DocPosition = {
        line: wordStartPos.line,
        character: wordStartPos.character + span.startOffset,
      };
      const end: DocPosition = {
        line: wordStartPos.line,
        character: wordStartPos.character + span.endOffset,
      };

      const tracked: TrackedAmbiguitySpan = {
        id: `${documentUri}:${start.line}:${start.character}:${Date.now()}`,
        documentUri,
        range: { start, end },
        chosen: span.chosen,
        alternate: span.alternate,
        raw: span.raw,
      };

      docSpans.push(tracked);
    }

    if (docSpans.length > this.maxSpansPerDoc) {
      docSpans.splice(0, docSpans.length - this.maxSpansPerDoc);
    }
  }

  public findSpanAt(
    documentUri: string,
    position: DocPosition,
    getTextInRange: (range: DocRange) => string
  ): TrackedAmbiguitySpan | null {
    const docSpans = this.spansByDoc.get(documentUri);
    if (!docSpans || docSpans.length === 0) return null;

    // Filter and find span containing position where text still matches chosen
    for (let i = docSpans.length - 1; i >= 0; i--) {
      const span = docSpans[i];
      if (this.rangeContains(span.range, position)) {
        const textAtRange = getTextInRange(span.range);
        if (textAtRange === span.chosen) {
          return span;
        } else {
          // Invalidate stale span
          docSpans.splice(i, 1);
        }
      }
    }

    return null;
  }

  public removeSpan(span: TrackedAmbiguitySpan): void {
    const docSpans = this.spansByDoc.get(span.documentUri);
    if (!docSpans) return;

    const idx = docSpans.findIndex((s) => s.id === span.id);
    if (idx !== -1) {
      docSpans.splice(idx, 1);
    }
  }

  public clear(): void {
    this.spansByDoc.clear();
  }

  private rangeContains(range: DocRange, pos: DocPosition): boolean {
    if (pos.line < range.start.line || pos.line > range.end.line) return false;
    if (pos.line === range.start.line && pos.character < range.start.character) return false;
    if (pos.line === range.end.line && pos.character > range.end.character) return false;
    return true;
  }
}
