import * as vscode from "vscode";
import { transliterateText } from "../engine/transliterator.js";
import { SuggestionEngine } from "../engine/suggestions.js";

export function registerFidelCommands(
  context: vscode.ExtensionContext,
  getState: () => boolean,
  setState: (enabled: boolean) => void
): void {
  // Fidel: Toggle Amharic Input
  const toggleCommand = vscode.commands.registerCommand("fidel.toggleInput", () => {
    const newState = !getState();
    setState(newState);
    vscode.window.setStatusBarMessage(
      newState ? "Fidel ፊደል: Amharic input enabled" : "Fidel ፊደል: Amharic input disabled",
      2500
    );
  });

  // Fidel: Enable Amharic Input
  const enableCommand = vscode.commands.registerCommand("fidel.enableInput", () => {
    setState(true);
    vscode.window.setStatusBarMessage("Fidel ፊደል: Amharic input enabled", 2500);
  });

  // Fidel: Disable Amharic Input
  const disableCommand = vscode.commands.registerCommand("fidel.disableInput", () => {
    setState(false);
    vscode.window.setStatusBarMessage("Fidel ፊደል: Amharic input disabled", 2500);
  });

  // Fidel: Convert Selection to Amharic
  const convertSelectionCommand = vscode.commands.registerCommand(
    "fidel.convertSelection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      if (!text) {
        vscode.window.showInformationMessage("Fidel: Please select text to convert.");
        return;
      }

      const config = vscode.workspace.getConfiguration("fidel");
      const convertPunctuation = config.get<boolean>("convertPunctuation", false);
      const convertNumbers = config.get<boolean>("convertNumbers", false);

      const converted = transliterateText(text, { convertPunctuation, convertNumbers });

      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, converted);
      });

      vscode.window.setStatusBarMessage("Fidel ፊደል: Selection converted to Ethiopic script", 2500);
    }
  );

  // Fidel: Add Personal Dictionary Entry
  const addDictCommand = vscode.commands.registerCommand("fidel.addDictionaryEntry", async () => {
    const latin = await vscode.window.showInputBox({
      prompt: "Enter phonetic Latin word (e.g. myword)",
      placeHolder: "myword",
    });

    if (!latin) return;

    const ethiopic = await vscode.window.showInputBox({
      prompt: `Enter Ethiopic script for "${latin}" (e.g. ሚያቃልል)`,
      placeHolder: "ሚያቃልል",
    });

    if (!ethiopic) return;

    const config = vscode.workspace.getConfiguration("fidel");
    const dict = { ...config.get<Record<string, string>>("dictionary", {}) };
    dict[latin.trim().toLowerCase()] = ethiopic.trim();

    await config.update("dictionary", dict, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Fidel: Added "${latin}" → "${ethiopic}" to personal dictionary.`);
  });

  // Fidel: Remove Personal Dictionary Entry
  const removeDictCommand = vscode.commands.registerCommand("fidel.removeDictionaryEntry", async () => {
    const config = vscode.workspace.getConfiguration("fidel");
    const dict = { ...config.get<Record<string, string>>("dictionary", {}) };
    const keys = Object.keys(dict);

    if (keys.length === 0) {
      vscode.window.showInformationMessage("Fidel: Personal dictionary is empty.");
      return;
    }

    const selected = await vscode.window.showQuickPick(
      keys.map((k) => `${k} → ${dict[k]}`),
      { placeHolder: "Select a dictionary entry to remove" }
    );

    if (!selected) return;

    const keyToRemove = selected.split(" → ")[0].trim();
    delete dict[keyToRemove];

    await config.update("dictionary", dict, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Fidel: Removed "${keyToRemove}" from personal dictionary.`);
  });

  // Fidel: Open Personal Dictionary Settings
  const openDictCommand = vscode.commands.registerCommand("fidel.openDictionary", async () => {
    await vscode.commands.executeCommand("workbench.action.openSettings", "fidel.dictionary");
  });

  // Fidel: Toggle Smart Correction
  const toggleSmartCorrectionCommand = vscode.commands.registerCommand("fidel.toggleSmartCorrection", async () => {
    const config = vscode.workspace.getConfiguration("fidel");
    const current = config.get<boolean>("smartCorrection", true);
    const nextState = !current;
    await config.update("smartCorrection", nextState, vscode.ConfigurationTarget.Global);
    vscode.window.setStatusBarMessage(
      nextState ? "Fidel ፊደል: Smart phonetic correction enabled" : "Fidel ፊደል: Smart phonetic correction disabled",
      2500
    );
  });

  // Fidel: Show Homophone Suggestions
  const showSuggestionsCommand = vscode.commands.registerCommand("fidel.showSuggestions", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    let targetRange: vscode.Range;
    let text: string;

    if (!selection.isEmpty) {
      targetRange = selection;
      text = editor.document.getText(selection);
    } else {
      const wordRange = editor.document.getWordRangeAtPosition(selection.active);
      if (!wordRange) {
        vscode.window.showInformationMessage("Fidel: Please select a word or place cursor on a word to see suggestions.");
        return;
      }
      targetRange = wordRange;
      text = editor.document.getText(wordRange);
    }

    const config = vscode.workspace.getConfiguration("fidel");
    const convertPunctuation = config.get<boolean>("convertPunctuation", false);
    const convertNumbers = config.get<boolean>("convertNumbers", false);

    const primaryResult = transliterateText(text, { convertPunctuation, convertNumbers });
    const suggestionEngine = new SuggestionEngine();
    const candidates = suggestionEngine.getCandidateObjects(text, primaryResult);

    if (candidates.length === 0) {
      vscode.window.showInformationMessage("Fidel: No candidate suggestions found for selection.");
      return;
    }

    const selected = await vscode.window.showQuickPick(
      candidates.map((c) => ({
        label: c.ethiopic,
        description: c.description,
        value: c.ethiopic,
      })),
      { placeHolder: `Select Ethiopic candidate for "${text}"` }
    );

    if (!selected) return;

    await editor.edit((editBuilder) => {
      editBuilder.replace(targetRange, selected.value);
    });
  });

  context.subscriptions.push(
    toggleCommand,
    enableCommand,
    disableCommand,
    convertSelectionCommand,
    addDictCommand,
    removeDictCommand,
    openDictCommand,
    toggleSmartCorrectionCommand,
    showSuggestionsCommand
  );
}
