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

import { CommandManager } from "./command-manager"
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
    Container.set(TOKENS.Config, Container.get(VscodeConfig))
    // log
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    // init providers, MUST wait, todo: parallel
    await Container.get(ProviderRegistry).initialize()
    // log
    Container.set(TOKENS_VSCODE.Git, Container.get(VscodeGit))
    // log, config, context
    Container.set(TOKENS_VSCODE.Webview, Container.get(VscodeWebview))
    // log, config, provider
    Container.set(TOKENS.CommitManager, Container.get(CommitManager))
    // log, commit, git
    Container.set(TOKENS_VSCODE.StatusBar, Container.get(StatusBarManager))

    // register commands
    Container.get(CommandManager)

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
