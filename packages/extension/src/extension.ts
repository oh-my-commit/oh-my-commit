import "reflect-metadata"

import { CommitManager, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container } from "typedi"
import * as vscode from "vscode"
import { CommandManager } from "./commands/command-manager"
import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VscodeGit } from "./vscode-git"
import { StatusBarManager } from "./vscode-statusbar"
import { VSCODE_TOKENS } from "./vscode-token"

export async function activate(context: vscode.ExtensionContext) {
  try {
    const logger = new VscodeLogger("host")
    logger.info("Initializing Oh My Commit")
    Container.set(TOKENS.Logger, logger)

    logger.info("Initializing context")
    Container.set(VSCODE_TOKENS.Context, context)

    logger.info("Initializing git service")
    const gitService = new VscodeGit()
    Container.set(VSCODE_TOKENS.GitService, gitService)

    logger.info("Initializing config")
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    logger.info("Initializing provider registry")
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))

    logger.info("Initializing commit manager")
    Container.set(TOKENS.CommitManager, Container.get(CommitManager))

    logger.info("Initializing statusbar service")
    Container.set(VSCODE_TOKENS.StatusbarService, Container.get(StatusBarManager))

    logger.info("Initializing command manager")
    const commandManager = Container.get(CommandManager)
    logger.info("Initialized command manager: ", commandManager)

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
