import "reflect-metadata"

import { CommitManager, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container } from "typedi"
import * as vscode from "vscode"
import { CommandManager } from "./commands/command-manager"
import { QuickCommitCommand } from "./commands/quick-commit"
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
    const logger = new VscodeLogger("host")
    Container.set(TOKENS.Logger, logger)
    logger.info("Initializing Oh My Commit")

    logger.info("Initializing Context")
    Container.set(VSCODE_TOKENS.Context, context)

    logger.info("Initializing Config")
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    logger.info("Initializing Git Service")
    Container.set(VSCODE_TOKENS.GitService, Container.get(VscodeGit))

    logger.info("Initializing Webview Service")
    Container.set(VSCODE_TOKENS.WebviewService, Container.get(VscodeWebview))

    logger.info("Initializing Provider Registry")
    Container.set(TOKENS.ProviderRegistry, Container.get(ProviderRegistry))

    logger.info("Initializing Commit Manager")
    const commitManager = Container.get(CommitManager)
    await commitManager.initProviders()
    Container.set(TOKENS.CommitManager, commitManager)

    logger.info("Initializing Quick Commit Command")
    const quickCommitCommand = Container.get(QuickCommitCommand)
    quickCommitCommand.initialize()

    logger.info("Initializing statusbar service")
    const statusBarManager = Container.get(StatusBarManager)
    await statusBarManager.initialize()

    logger.info("Initializing command manager .")
    const commandManager = Container.get(CommandManager)
    logger.info("Initializing command manager ..")
    commandManager.initialize()
    logger.info("Initialized command manager... ", commandManager)

    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    void vscode.window.showErrorMessage(`Failed to initialize Oh My Commit: ${message}`)
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
