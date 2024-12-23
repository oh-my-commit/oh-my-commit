import "reflect-metadata"

import { CommitManager, TOKENS, formatError } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container } from "typedi"
import * as vscode from "vscode"
import { CommandManager } from "./commands/command-manager"
import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VscodeGit } from "./vscode-git"
import { StatusBarManager } from "./vscode-statusbar"
import { VSCODE_TOKENS } from "./vscode-token"
import { VscodeWebview } from "./vscode-webview"

export async function activate(context: vscode.ExtensionContext) {
  /**
   * logger(VscodeLogger)
   * config(VscodeConfig)
   * context(VscodeContext)
   * git(VscodeGit)
   *
   * webview(VscodeWebview)
   * providerRegistry(ProviderRegistry)
   * commitManager(CommitManager)
   * commandManager(CommandManager
   */
  try {
    const logger = new VscodeLogger()
    logger.info("Initializing Oh My Commit")

    Container.set(VSCODE_TOKENS.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    Container.set(TOKENS.Config, Container.get(VscodeConfig))
    Container.set(VSCODE_TOKENS.GitService, Container.get(VscodeGit))
    Container.set(VSCODE_TOKENS.WebviewService, Container.get(VscodeWebview))
    Container.set(TOKENS.CommitManager, Container.get(CommitManager))

    logger.info("Initializing command manager .")
    Container.get(CommandManager)

    logger.info("Initializing status bar")
    Container.get(StatusBarManager)

    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    void vscode.window.showErrorMessage(`Failed to initialize Oh My Commit: ${formatError(error)}`)
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
