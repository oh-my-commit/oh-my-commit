import { CommandManager } from "@/commands/command-manager"
import { vscodeCommitManager } from "@/vscode-commit-adapter"
import { VscodeGit } from "@/vscode-git"
import { StatusBarManager } from "@/vscode-statusbar"

import * as vscode from "vscode"

export async function activate(context: vscode.ExtensionContext) {
  try {
    const gitService = new VscodeGit()
    new CommandManager(context, gitService, vscodeCommitManager)

    new StatusBarManager(vscodeCommitManager, gitService)
    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    vscode.window.showErrorMessage(`Failed to initialize Oh My Commit: ${message}`)
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
