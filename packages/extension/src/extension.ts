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

import { APP_NAME, CommitManager, TOKENS, formatError } from "@shared/common"
import { ProviderRegistry } from "@shared/server"

import { CommandManager } from "./commands/command-manager"
import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VscodeGit } from "./vscode-git"
import { StatusBarManager } from "./vscode-statusbar"
import { VSCODE_TOKENS as TOKENS_VSCODE } from "./vscode-token"
import { VscodeWebview } from "./vscode-webview"

export async function activate(context: vscode.ExtensionContext) {
  try {
    const logger = Container.get(VscodeLogger)
    logger.info(`Initializing ${APP_NAME} extension...`)

    Container.set(TOKENS_VSCODE.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    Container.set(TOKENS.Config, Container.get(VscodeConfig))
    Container.set(TOKENS_VSCODE.Git, Container.get(VscodeGit))
    Container.set(TOKENS_VSCODE.Webview, Container.get(VscodeWebview))
    Container.set(TOKENS.CommitManager, Container.get(CommitManager))

    logger.info(`Initializing Background`)
    // init providers, MUST wait
    await Container.get(ProviderRegistry).initialize()
    // register commands
    Container.get(CommandManager)

    logger.info(`Initializing UI`)
    // status bar would call `select-model` or any other commands
    Container.get(StatusBarManager)

    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    void vscode.window.showErrorMessage(
      `Failed to initialize Oh My Commit: ${formatError(error)}`
    )
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
