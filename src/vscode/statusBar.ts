import * as vscode from "vscode";

export class FidelStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = "fidel.toggleInput";
  }

  public update(enabled: boolean): void {
    if (enabled) {
      this.statusBarItem.text = "$(keyboard) ፊደል: ON";
      this.statusBarItem.tooltip = "Fidel Amharic Input is ON — Click or press Ctrl+Alt+A to disable";
      this.statusBarItem.color = new vscode.ThemeColor("statusBarItem.prominentForeground");
    } else {
      this.statusBarItem.text = "$(keyboard) ፊደል: OFF";
      this.statusBarItem.tooltip = "Fidel Amharic Input is OFF — Click or press Ctrl+Alt+A to enable";
      this.statusBarItem.color = undefined;
    }
    this.statusBarItem.show();
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
