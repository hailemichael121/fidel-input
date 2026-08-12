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

  public update(enabled: boolean, bypassed: boolean = false): void {
    if (enabled && bypassed) {
      this.statusBarItem.text = "$(pass-filled) ፊደል: SKIPPED (Latin)";
      this.statusBarItem.tooltip = "Transliteration is SKIPPED — Typing raw Latin text (Press Alt+X or Ctrl+Alt+B to resume)";
      this.statusBarItem.color = new vscode.ThemeColor("statusBarItem.warningForeground");
    } else if (enabled) {
      this.statusBarItem.text = "$(keyboard) ፊደል: ON";
      this.statusBarItem.tooltip = "Fidel Amharic Input is ON — Press Ctrl+Alt+A to disable, Alt+X to skip transliteration";
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
