import * as vscode from "vscode";

export class FidelViewProvider implements vscode.TreeDataProvider<vscode.TreeItem>, vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.changeEmitter.event;

  constructor(
    private isEnabled: () => boolean,
    private isBypassed: () => boolean = () => false
  ) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    const enabled = this.isEnabled();
    const bypassed = this.isBypassed();
    const config = vscode.workspace.getConfiguration("fidel");
    const smartCorrection = config.get<boolean>("smartCorrection", true);
    const convertPunctuation = config.get<boolean>("convertPunctuation", true);
    const convertNumbers = config.get<boolean>("convertNumbers", true);
    const suggestions = config.get<boolean>("suggestions", true);

    const statusItem = new vscode.TreeItem(
      enabled ? "Amharic Input: ON" : "Amharic Input: OFF",
      vscode.TreeItemCollapsibleState.None
    );
    statusItem.command = {
      command: "fidel.toggleInput",
      title: enabled ? "Disable Fidel Input" : "Enable Fidel Input",
    };
    statusItem.tooltip = enabled ? "Fidel input is ON — click to disable" : "Fidel input is OFF — click to enable";
    statusItem.iconPath = new vscode.ThemeIcon(enabled ? "check" : "circle-outline");

    const bypassItem = new vscode.TreeItem(
      bypassed ? "Latin Skip (Bypass): ACTIVE" : "Latin Skip (Bypass): OFF",
      vscode.TreeItemCollapsibleState.None
    );
    bypassItem.command = {
      command: "fidel.toggleBypass",
      title: "Toggle Skip Transliteration",
    };
    bypassItem.tooltip = "Temporarily skip Ethiopic transliteration to type raw Latin text (Alt+X / Ctrl+Alt+B)";
    bypassItem.iconPath = new vscode.ThemeIcon(bypassed ? "pass-filled" : "pass");

    const restartItem = new vscode.TreeItem(
      "Restart Engine / Reload Extension",
      vscode.TreeItemCollapsibleState.None
    );
    restartItem.command = {
      command: "fidel.restartEngine",
      title: "Restart Extension Engine",
    };
    restartItem.tooltip = "Re-initialize Fidel engine, clear composition buffer, and option to reload window";
    restartItem.iconPath = new vscode.ThemeIcon("refresh");

    const convertItem = new vscode.TreeItem(
      "Convert Selection to Ethiopic",
      vscode.TreeItemCollapsibleState.None
    );
    convertItem.command = {
      command: "fidel.convertSelection",
      title: "Convert Selection",
    };
    convertItem.tooltip = "Convert highlighted Latin text into Ethiopic script (Ctrl+Alt+F)";
    convertItem.iconPath = new vscode.ThemeIcon("symbol-string");

    const punctItem = new vscode.TreeItem(
      convertPunctuation ? "Ethiopic Punctuation: ON" : "Ethiopic Punctuation: OFF",
      vscode.TreeItemCollapsibleState.None
    );
    punctItem.command = {
      command: "fidel.togglePunctuation",
      title: "Toggle Punctuation",
    };
    punctItem.tooltip = "Toggle automatic Latin punctuation to Ethiopic punctuation conversion (,.!? -> ፤።፧)";
    punctItem.iconPath = new vscode.ThemeIcon(convertPunctuation ? "symbol-enum-member" : "symbol-enum");

    const numItem = new vscode.TreeItem(
      convertNumbers ? "Ethiopic Numerals: ON" : "Ethiopic Numerals: OFF",
      vscode.TreeItemCollapsibleState.None
    );
    numItem.command = {
      command: "fidel.toggleNumbers",
      title: "Toggle Ethiopic Numerals",
    };
    numItem.tooltip = "Toggle automatic Arabic digits to Ethiopic numerals conversion (1, 2, 3 -> ፩, ፪, ፫)";
    numItem.iconPath = new vscode.ThemeIcon(convertNumbers ? "symbol-numeric" : "number");

    const suggItem = new vscode.TreeItem(
      suggestions ? "Candidate Suggestions Overlay: ON" : "Candidate Suggestions Overlay: OFF",
      vscode.TreeItemCollapsibleState.None
    );
    suggItem.command = {
      command: "fidel.toggleSuggestions",
      title: "Toggle Suggestions Overlay",
    };
    suggItem.tooltip = "Toggle IntelliSense candidate dropdown box under cursor";
    suggItem.iconPath = new vscode.ThemeIcon("lightbulb");

    const smartItem = new vscode.TreeItem(
      smartCorrection ? "Smart Phonetic Correction: ON" : "Smart Phonetic Correction: OFF",
      vscode.TreeItemCollapsibleState.None
    );
    smartItem.command = {
      command: "fidel.toggleSmartCorrection",
      title: "Toggle Smart Correction",
    };
    smartItem.tooltip = "Toggle smart phonetic correction for double consonants";
    smartItem.iconPath = new vscode.ThemeIcon("sparkle");

    const dictItem = new vscode.TreeItem(
      "Personal Dictionary Settings",
      vscode.TreeItemCollapsibleState.None
    );
    dictItem.command = {
      command: "fidel.openDictionary",
      title: "Open Dictionary Settings",
    };
    dictItem.tooltip = "Configure custom word mappings in settings.json";
    dictItem.iconPath = new vscode.ThemeIcon("book");

    return [statusItem, bypassItem, restartItem, convertItem, punctItem, numItem, suggItem, smartItem, dictItem];
  }

  refresh(): void {
    this.changeEmitter.fire();
  }

  dispose(): void {
    this.changeEmitter.dispose();
  }
}
