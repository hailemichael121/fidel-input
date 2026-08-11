import * as vscode from "vscode";
import { FidelStatusBar } from "./vscode/statusBar.js";
import { InputInterceptor } from "./vscode/inputInterceptor.js";
import { registerFidelCommands } from "./vscode/commands.js";

let enabled = false;

class FidelViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly changeEmitter = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    const statusItem = new vscode.TreeItem(
      enabled ? "✓ አማርኛ Input: ON" : "○ አማርኛ Input: OFF",
      vscode.TreeItemCollapsibleState.None
    );

    statusItem.command = {
      command: "fidel.toggleInput",
      title: enabled ? "Disable Fidel Input" : "Enable Fidel Input",
    };

    statusItem.tooltip = enabled ? "Fidel input is ON — click to disable" : "Fidel input is OFF — click to enable";
    statusItem.iconPath = new vscode.ThemeIcon(enabled ? "check" : "circle-outline");

    const convertItem = new vscode.TreeItem(
      "⇄ Convert Selection to Ethiopic",
      vscode.TreeItemCollapsibleState.None
    );

    convertItem.command = {
      command: "fidel.convertSelection",
      title: "Convert Selection",
    };
    convertItem.iconPath = new vscode.ThemeIcon("symbol-string");

    return [statusItem, convertItem];
  }

  refresh(): void {
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("Fidel Input extension activating...");

  const config = vscode.workspace.getConfiguration("fidel");
  enabled = config.get<boolean>("enableByDefault", false);

  const statusBar = new FidelStatusBar();
  const viewProvider = new FidelViewProvider();

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

  context.subscriptions.push(
    statusBar,
    interceptor,
    treeView,
    viewProvider
  );

  updateState(enabled);
  console.log("Fidel Input extension activated successfully.");
}

export function deactivate(): void {
  console.log("Fidel Input extension deactivated.");
}
