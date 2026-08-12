import * as vscode from "vscode";
import { CompositionEngine } from "../engine/composition.js";

export class InputInterceptor implements vscode.Disposable {
  private engine: CompositionEngine;
  private isEnabled: () => boolean;
  private isProcessingEdit: boolean = false;
  private lastCompositionPosition: vscode.Position | null = null;

  private typeListener: vscode.Disposable | null = null;
  private deleteLeftListener: vscode.Disposable | null = null;
  private selectionListener: vscode.Disposable | null = null;

  constructor(isEnabled: () => boolean = () => true) {
    this.engine = this.createEngine();
    this.isEnabled = isEnabled;
    this.register();
    this.updateContext();
  }

  private createEngine(): CompositionEngine {
    const config = vscode.workspace.getConfiguration("fidel");
    const convertPunctuation = config.get<boolean>("convertPunctuation", true);
    const convertNumbers = config.get<boolean>("convertNumbers", true);
    const dictionary = config.get<Record<string, string>>("dictionary", {});
    const smartCorrection = config.get<boolean>("smartCorrection", true);

    return new CompositionEngine({
      convertPunctuation,
      convertNumbers,
      dictionary,
      smartCorrection,
    });
  }

  private updateContext(): void {
    const hasComposition = this.isEnabled() && this.engine.raw.length > 0;
    void vscode.commands.executeCommand("setContext", "fidel.hasComposition", hasComposition);
  }

  private register(): void {
    // Normal character input interception
    this.typeListener = vscode.commands.registerCommand(
      "type",
      async (args: { text: string }) => {
        const editor = vscode.window.activeTextEditor;

        if (!this.isEnabled() || !editor || !args.text) {
          this.resetCompositionState();
          return vscode.commands.executeCommand("default:type", args);
        }

        // Ignore multi-char inserts or newlines
        if (args.text.length > 1 || args.text === "\n" || args.text === "\r") {
          this.resetCompositionState();
          const config = vscode.workspace.getConfiguration("fidel");
          if (config.get<boolean>("autoDisableOnEnter", false)) {
            void vscode.commands.executeCommand("fidel.disableInput");
          }
          return vscode.commands.executeCommand("default:type", args);
        }

        // Ignore multi-cursor typing
        if (editor.selections.length > 1) {
          this.resetCompositionState();
          return vscode.commands.executeCommand("default:type", args);
        }

        const selection = editor.selection;

        // If there is an active selection highlight, reset composition and let default type handle
        if (!selection.isEmpty) {
          this.resetCompositionState();
          return vscode.commands.executeCommand("default:type", args);
        }

        // If user moved cursor away from last composition position, reset buffer before new input
        if (
          this.lastCompositionPosition &&
          !selection.active.isEqual(this.lastCompositionPosition)
        ) {
          this.resetCompositionState();
        }

        const isFirstChar = this.engine.raw.length === 0;
        const state = this.engine.feedChar(args.text);
        this.updateContext();

        this.isProcessingEdit = true;
        try {
          await editor.edit(
            (editBuilder) => {
              if (state.replaceLength > 0) {
                const startPos = selection.active.translate(0, -state.replaceLength);
                const deleteRange = new vscode.Range(startPos, selection.active);
                editBuilder.delete(deleteRange);
              }
              editBuilder.insert(selection.active, state.rendered);
            },
            {
              undoStopBefore: isFirstChar,
              undoStopAfter: state.committed,
            }
          );

          if (state.committed) {
            // Word committed (space or boundary delimiter pressed). Reset composition session completely
            this.resetCompositionState();
          } else {
            // Update last composition position to new cursor location
            this.lastCompositionPosition = editor.selection.active;
          }
        } finally {
          this.isProcessingEdit = false;
        }
      }
    );

    // Scoped Backspace key handler (triggered ONLY when editorTextFocus && fidel.inputEnabled && fidel.hasComposition)
    this.deleteLeftListener = vscode.commands.registerCommand(
      "fidel.deleteLeft",
      async () => {
        const editor = vscode.window.activeTextEditor;

        if (!this.isEnabled() || !editor || !this.engine.raw) {
          this.resetCompositionState();
          return;
        }

        if (editor.selections.length > 1) {
          this.resetCompositionState();
          return;
        }

        const selection = editor.selection;

        if (!selection.isEmpty) {
          this.resetCompositionState();
          return;
        }

        if (
          this.lastCompositionPosition &&
          !selection.active.isEqual(this.lastCompositionPosition)
        ) {
          this.resetCompositionState();
          return;
        }

        // Pop Latin chars from active composition buffer
        const state = this.engine.backspace();
        this.updateContext();

        this.isProcessingEdit = true;
        try {
          await editor.edit((editBuilder) => {
            if (state.replaceLength > 0) {
              const startPos = selection.active.translate(0, -state.replaceLength);
              const deleteRange = new vscode.Range(startPos, selection.active);
              editBuilder.delete(deleteRange);
            }
            if (state.rendered.length > 0) {
              editBuilder.insert(selection.active, state.rendered);
            }
          });
          this.lastCompositionPosition = editor.selection.active;
        } finally {
          this.isProcessingEdit = false;
        }
      }
    );

    // Track selection changes (e.g. user clicking away with mouse or arrow keys)
    this.selectionListener = vscode.window.onDidChangeTextEditorSelection((e) => {
      if (this.isProcessingEdit) {
        return;
      }

      const currentPos = e.textEditor.selection.active;

      if (
        this.lastCompositionPosition &&
        !currentPos.isEqual(this.lastCompositionPosition)
      ) {
        this.resetCompositionState();
      }
    });
  }

  public resetComposition(): void {
    this.resetCompositionState();
  }

  public reset(): void {
    this.resetCompositionState();
  }

  private resetCompositionState(): void {
    this.engine = this.createEngine();
    this.lastCompositionPosition = null;
    this.updateContext();
  }

  public dispose(): void {
    this.typeListener?.dispose();
    this.deleteLeftListener?.dispose();
    this.selectionListener?.dispose();
    void vscode.commands.executeCommand("setContext", "fidel.hasComposition", false);
  }
}
