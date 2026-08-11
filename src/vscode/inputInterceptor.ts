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
    this.engine = new CompositionEngine();
    this.isEnabled = isEnabled;
    this.register();
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

        // Ignore multi-cursor typing for MVP
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

        const state = this.engine.feedChar(args.text);

        this.isProcessingEdit = true;
        try {
          await editor.edit((editBuilder) => {
            if (state.replaceLength > 0) {
              const startPos = selection.active.translate(0, -state.replaceLength);
              const deleteRange = new vscode.Range(startPos, selection.active);
              editBuilder.delete(deleteRange);
            }
            editBuilder.insert(selection.active, state.rendered);
          });

          if (state.committed) {
            // Word is committed (space or boundary delimiter pressed). Reset composition session completely
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

    // Backspace key interception
    this.deleteLeftListener = vscode.commands.registerCommand(
      "deleteLeft",
      async () => {
        const editor = vscode.window.activeTextEditor;

        if (!this.isEnabled() || !editor) {
          this.resetCompositionState();
          return this.performDefaultDeleteLeft(editor);
        }

        if (editor.selections.length > 1) {
          this.resetCompositionState();
          return this.performDefaultDeleteLeft(editor);
        }

        const selection = editor.selection;

        // If user has a text selection highlight, delete selection
        if (!selection.isEmpty) {
          this.resetCompositionState();
          return this.performDefaultDeleteLeft(editor);
        }

        // If user moved cursor away from last composition position, reset composition & perform default backspace
        if (
          this.lastCompositionPosition &&
          !selection.active.isEqual(this.lastCompositionPosition)
        ) {
          this.resetCompositionState();
          return this.performDefaultDeleteLeft(editor);
        }

        // If no active composition buffer: perform default editor backspace deletion
        if (!this.engine.raw) {
          this.resetCompositionState();
          return this.performDefaultDeleteLeft(editor);
        }

        // Pop 1 Latin char from active composition buffer
        const state = this.engine.backspace();

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
          // Update position tracker after backspace
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

      // If cursor moved away from last active composition position (via arrow keys, mouse, etc.), reset composition
      if (
        this.lastCompositionPosition &&
        !currentPos.isEqual(this.lastCompositionPosition)
      ) {
        this.resetCompositionState();
      }
    });
  }

  /**
   * Safe programmatic default backspace implementation since VS Code has no 'default:deleteLeft' command.
   */
  private async performDefaultDeleteLeft(editor?: vscode.TextEditor): Promise<void> {
    if (!editor) {
      return;
    }

    const selection = editor.selection;

    // Highlighted selection deletion
    if (!selection.isEmpty) {
      this.isProcessingEdit = true;
      try {
        await editor.edit((editBuilder) => {
          editBuilder.delete(selection);
        });
      } finally {
        this.isProcessingEdit = false;
      }
      return;
    }

    const pos = selection.active;

    // Top-left of document
    if (pos.line === 0 && pos.character === 0) {
      return;
    }

    let deleteRange: vscode.Range;
    if (pos.character > 0) {
      const prevPos = pos.translate(0, -1);
      deleteRange = new vscode.Range(prevPos, pos);
    } else {
      const prevLine = editor.document.lineAt(pos.line - 1);
      const prevPos = prevLine.range.end;
      deleteRange = new vscode.Range(prevPos, pos);
    }

    this.isProcessingEdit = true;
    try {
      await editor.edit((editBuilder) => {
        editBuilder.delete(deleteRange);
      });
    } finally {
      this.isProcessingEdit = false;
    }
  }

  public resetComposition(): void {
    this.resetCompositionState();
  }

  public reset(): void {
    this.resetCompositionState();
  }

  private resetCompositionState(): void {
    this.engine.reset();
    this.lastCompositionPosition = null;
  }

  public dispose(): void {
    this.typeListener?.dispose();
    this.deleteLeftListener?.dispose();
    this.selectionListener?.dispose();
  }
}
