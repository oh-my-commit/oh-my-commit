/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import "reflect-metadata"

import { Container } from "typedi"
import * as vscode from "vscode"

import { APP_NAME, CommitManager, formatError } from "@shared/common"
import { ProviderRegistry } from "@shared/server"

import { CommandManager } from "./command-manager"
import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VscodeGit } from "./vscode-git"
import { StatusBarManager } from "./vscode-statusbar"
import { TOKENS } from "./vscode-token"
import { VscodeWebview } from "./vscode-webview"

export function activate(context: vscode.ExtensionContext) {
  const logger = Container.get(VscodeLogger)
  try {
    logger.info(`Initializing ${APP_NAME} extension...`)

    // basic
    Container.set(TOKENS.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    // Check workspace validity
    const workspaceFolders = vscode.workspace.workspaceFolders
    const workspaceRoot = workspaceFolders
      ? workspaceFolders[0]?.uri.fsPath
      : ""
    const isWorkspaceValid =
      workspaceRoot && vscode.workspace.fs.stat(vscode.Uri.file(workspaceRoot))
    // Container.set(TOKENS.IsWorkspaceValid, isWorkspaceValid)

    // Always set up webview first
    logger.info("setting webview...")
    Container.set(TOKENS.Webview, Container.get(VscodeWebview))

    if (!isWorkspaceValid) {
      logger.warn("No valid workspace found. Some features will be disabled.")
      return
    }

    // generic - only initialize these when workspace is valid
    logger.info("setting provider manager...")
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    logger.info("setting git manager...")
    Container.set(TOKENS.GitManager, Container.get(VscodeGit))
    logger.info("setting commit manager...")
    Container.set(TOKENS.CommitManager, Container.get(CommitManager)) // provider
    logger.info("setting status bar...")
    Container.set(TOKENS.StatusBar, Container.get(StatusBarManager)) // commit, git

    logger.info("Initializing providers...")
    // Initialize providers asynchronously
    Container.get(ProviderRegistry)
      .initialize()
      .then(() => {
        logger.debug("Provider initialization complete")
        // Notify StatusBar to update if needed
        void Container.get(StatusBarManager).update()
      })
      .catch((error) => {
        logger.error("Failed to initialize providers:", error)
      })

    // register commands
    Container.get(CommandManager)

    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    logger.error({ error })
    logger.error(formatError(error, "Failed to initialize Oh My Commit"))
    void vscode.window.showErrorMessage(
      formatError(error, "Failed to initialize Oh My Commit")
    )
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
