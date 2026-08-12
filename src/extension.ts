import * as vscode from "vscode";
import { FidelStatusBar } from "./vscode/statusBar.js";
import { InputInterceptor } from "./vscode/inputInterceptor.js";
import { registerFidelCommands } from "./vscode/commands.js";
import { FidelViewProvider } from "./vscode/activityBar.js";
import { FidelCompletionProvider } from "./vscode/completionProvider.js";

let enabled = false;
let bypassed = false;

export function activate(context: vscode.ExtensionContext): void {
  console.log("Fidel Input extension activating...");

  const config = vscode.workspace.getConfiguration("fidel");
  enabled = config.get<boolean>("enableByDefault", false);

  const statusBar = new FidelStatusBar();
  const viewProvider = new FidelViewProvider(
    () => enabled,
    () => bypassed
  );

  const updateState = (newState: boolean, newBypassState: boolean = bypassed) => {
    enabled = newState;
    bypassed = newBypassState;
    void vscode.commands.executeCommand("setContext", "fidel.inputEnabled", enabled);
    void vscode.commands.executeCommand("setContext", "fidel.inputBypassed", bypassed);
    statusBar.update(enabled, bypassed);
    viewProvider.refresh();
  };

  const interceptor = new InputInterceptor(
    () => enabled,
    () => bypassed
  );

  registerFidelCommands(
    context,
    () => enabled,
    (newState) => {
      if (!newState) {
        bypassed = false;
      }
      updateState(newState, bypassed);
      interceptor.resetComposition();
    },
    () => bypassed,
    (newBypassState) => {
      updateState(enabled, newBypassState);
      interceptor.resetComposition();
    },
    () => {
      // onRestart
      interceptor.resetComposition();
      updateState(enabled, bypassed);
    },
    () => {
      // onResetComposition
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
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "'", "-", " "
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
