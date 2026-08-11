import * as vscode from "vscode";
import { transliterateText } from "../engine/transliterator.js";

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

      const converted = transliterateText(text, { convertPunctuation });

      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, converted);
      });

      vscode.window.setStatusBarMessage("Fidel ፊደል: Selection converted to Ethiopic script", 2500);
    }
  );

  context.subscriptions.push(
    toggleCommand,
    enableCommand,
    disableCommand,
    convertSelectionCommand
  );
}
