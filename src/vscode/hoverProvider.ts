import * as vscode from "vscode";
import { AmbiguitySpanTracker, TrackedAmbiguitySpan, DocRange } from "../engine/ambiguity.js";

export { AmbiguitySpanTracker, TrackedAmbiguitySpan };

export function toVsCodeRange(range: DocRange): vscode.Range {
  return new vscode.Range(
    new vscode.Position(range.start.line, range.start.character),
    new vscode.Position(range.end.line, range.end.character)
  );
}

export class AmbiguityHoverProvider implements vscode.HoverProvider {
  constructor(private readonly tracker: AmbiguitySpanTracker) {}

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const config = vscode.workspace.getConfiguration("fidel");
    const enableHover = config.get<boolean>("enableHoverDisambiguation", true);
    const suggestionsEnabled = config.get<boolean>("suggestions", true);

    if (!enableHover || !suggestionsEnabled) {
      return null;
    }

    const span = this.tracker.findSpanAt(
      document.uri.toString(),
      { line: position.line, character: position.character },
      (r) => document.getText(toVsCodeRange(r))
    );

    if (!span) {
      return null;
    }

    const vsRange = toVsCodeRange(span.range);
    const md = new vscode.MarkdownString(undefined, true);
    md.isTrusted = true;

    md.appendMarkdown(
      `**Fidel Syllable Disambiguation**\n\n` +
      `Current: \`${span.chosen}\`  \n` +
      `Alternate: \`${span.alternate}\`\n\n` +
      `[Use "${span.alternate}" instead](command:fidel.applyAlternateComposition?${encodeURIComponent(
        JSON.stringify([span])
      )})`
    );

    return new vscode.Hover(md, vsRange);
  }
}
