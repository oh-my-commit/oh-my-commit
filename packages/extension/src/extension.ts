import { CommandManager } from "@/commands/command-manager"
import { VscodeConfig, VscodeExtensionLogger, VscodeUIProvider } from "@/vscode-adapters"
import { VscodeGit } from "@/vscode-git"
import { StatusBarManager } from "@/vscode-statusbar"
import { CommitManager } from "@shared"

import * as vscode from "vscode"

export async function activate(context: vscode.ExtensionContext) {
  try {
    const commitManager = new CommitManager(
      new VscodeConfig(),
      new VscodeExtensionLogger("host"),
      new VscodeUIProvider(),
    )

    const gitService = new VscodeGit()
    new CommandManager(context, gitService, commitManager)

    new StatusBarManager(commitManager, gitService)
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
