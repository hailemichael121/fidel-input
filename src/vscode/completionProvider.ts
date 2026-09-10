import * as vscode from "vscode";
import { SuggestionEngine } from "../engine/suggestions.js";
import { transliterateText } from "../engine/transliterator.js";

export class FidelCompletionProvider implements vscode.CompletionItemProvider {
  private suggestionEngine = new SuggestionEngine();

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const config = vscode.workspace.getConfiguration("fidel");
    const enabled = config.get<boolean>("suggestions", true);
    if (!enabled) {
      return new vscode.CompletionList([], false);
    }

    const wordRange = document.getWordRangeAtPosition(position, /[\w'#-]+/);
    if (!wordRange) {
      return new vscode.CompletionList([], false);
    }

    const word = document.getText(wordRange);
    if (!word || word.length < 1) {
      return new vscode.CompletionList([], false);
    }

    const convertPunctuation = config.get<boolean>("convertPunctuation", true);
    const convertNumbers = config.get<boolean>("convertNumbers", true);
    const dictionary = config.get<Record<string, string>>("dictionary", {});

    const primary = transliterateText(word, { convertPunctuation, convertNumbers, dictionary });
    const candidates = this.suggestionEngine.getCandidateObjects(word, primary);

    const items = candidates.map((c, index) => {
      const item = new vscode.CompletionItem(c.ethiopic, vscode.CompletionItemKind.Text);
      item.filterText = word;
      item.insertText = c.ethiopic;
      item.detail = `Fidel Ethiopic: ${c.label}`;
      item.documentation = new vscode.MarkdownString(
        `**Phonetic Input**: \`${c.latin}\`  \n**Ethiopic**: ${c.ethiopic}  \n*${c.description}*`
      );
      item.range = wordRange;
      item.sortText = String(index).padStart(3, "0");
      return item;
    });

    const splitCandidate = this.suggestionEngine.getAmbiguousSplitCandidate(word, primary);
    if (splitCandidate && !items.some((it) => it.label === splitCandidate.ethiopic)) {
      const splitItem = new vscode.CompletionItem(splitCandidate.ethiopic, vscode.CompletionItemKind.Text);
      splitItem.filterText = word;
      splitItem.insertText = splitCandidate.ethiopic;
      splitItem.detail = `Fidel Disambiguation: ${splitCandidate.description}`;
      splitItem.documentation = new vscode.MarkdownString(
        `**Standalone Syllable Disambiguation**\n\n` +
        `• Current default: \`${primary}\`\n` +
        `• Standalone split: \`${splitCandidate.ethiopic}\`\n\n` +
        `*${splitCandidate.description}*`
      );
      splitItem.range = wordRange;
      splitItem.sortText = String(candidates.length + 1).padStart(3, "0");
      items.push(splitItem);
    }

    // isIncomplete: true tells VS Code to persistently query completion items on backspacing & typing
    return new vscode.CompletionList(items, true);
  }
}
