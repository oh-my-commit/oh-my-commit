/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
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
  try {
    const logger = Container.get(VscodeLogger)
    logger.info(`Initializing ${APP_NAME} extension...`)

    // basic
    Container.set(TOKENS.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    // generic
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    Container.set(TOKENS.GitManager, Container.get(VscodeGit))
    Container.set(TOKENS.Webview, Container.get(VscodeWebview))
    Container.set(TOKENS.CommitManager, Container.get(CommitManager)) // provider
    Container.set(TOKENS.StatusBar, Container.get(StatusBarManager)) // commit, git

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

    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    void vscode.window.showErrorMessage(
      formatError(error, "Failed to initialize Oh My Commit")
    )
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
