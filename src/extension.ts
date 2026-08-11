import * as vscode from "vscode";
import { FidelStatusBar } from "./vscode/statusBar.js";
import { InputInterceptor } from "./vscode/inputInterceptor.js";
import { registerFidelCommands } from "./vscode/commands.js";
import { FidelViewProvider } from "./vscode/activityBar.js";
import { FidelCompletionProvider } from "./vscode/completionProvider.js";

let enabled = false;

export function activate(context: vscode.ExtensionContext): void {
  console.log("Fidel Input extension activating...");

  const config = vscode.workspace.getConfiguration("fidel");
  enabled = config.get<boolean>("enableByDefault", false);

  const statusBar = new FidelStatusBar();
  const viewProvider = new FidelViewProvider(() => enabled);

  const updateState = (newState: boolean) => {
    enabled = newState;
    void vscode.commands.executeCommand("setContext", "fidel.inputEnabled", enabled);
    statusBar.update(enabled);
    viewProvider.refresh();
  };

  const interceptor = new InputInterceptor(() => enabled);

  registerFidelCommands(
    context,
    () => enabled,
    (newState) => {
      updateState(newState);
      interceptor.resetComposition();
    }
  );

  const treeView = vscode.window.createTreeView("fidelView", {
    treeDataProvider: viewProvider,
    showCollapseAll: false,
  });

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file" },
    new FidelCompletionProvider(),
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
  );

  context.subscriptions.push(
    statusBar,
    interceptor,
    treeView,
    viewProvider,
    completionProvider
  );

  updateState(enabled);
  console.log("Fidel Input extension activated successfully.");
}

export function deactivate(): void {
  console.log("Fidel Input extension deactivated.");
}
