import * as vscode from "vscode";

export class FidelViewProvider implements vscode.TreeDataProvider<vscode.TreeItem>, vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(private isEnabled: () => boolean) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    const enabled = this.isEnabled();

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
