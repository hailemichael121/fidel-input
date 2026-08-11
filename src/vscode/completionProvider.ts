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
    const enabled = config.get<boolean>("suggestions", false);
    if (!enabled) {
      return [];
    }

    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return [];
    }

    const word = document.getText(wordRange);
    if (!word || word.length < 2) {
      return [];
    }

    const convertPunctuation = config.get<boolean>("convertPunctuation", false);
    const convertNumbers = config.get<boolean>("convertNumbers", false);
    const dictionary = config.get<Record<string, string>>("dictionary", {});

    const primary = transliterateText(word, { convertPunctuation, convertNumbers, dictionary });
    const candidates = this.suggestionEngine.getCandidateObjects(word, primary);

    return candidates.map((c, index) => {
      const item = new vscode.CompletionItem(c.ethiopic, vscode.CompletionItemKind.Text);
      item.detail = `Fidel Ethiopic: ${c.label}`;
      item.documentation = new vscode.MarkdownString(
        `**Phonetic Input**: \`${c.latin}\`  \n**Ethiopic**: ${c.ethiopic}  \n*${c.description}*`
      );
      item.range = wordRange;
      item.sortText = String(index).padStart(3, "0");
      return item;
    });
  }
}
