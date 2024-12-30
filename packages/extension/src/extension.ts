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

import { APP_NAME, formatError } from "@shared/common"
import { GitCommitManager, ProviderRegistry } from "@shared/server"

import { Orchestrator } from "@/managers/orchestrator"
import { VscodeConfig } from "@/managers/vscode-config"
import { VscodeGit } from "@/managers/vscode-git"
import { VscodeLogger } from "@/managers/vscode-logger"
import { PreferenceMonitor } from "@/managers/vscode-preference-monitor"
import { StatusBarManager } from "@/managers/vscode-statusbar"
import { TOKENS } from "@/managers/vscode-tokens"
import { WebviewManager } from "@/webview/vscode-webview"
import { WebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

import { CommitMessageStore } from "./managers/commit-message-store"
import { CommandManager } from "./managers/vscode-command-manager"

export function activate(context: vscode.ExtensionContext) {
  const logger = Container.get(VscodeLogger)
  try {
    logger.info(`Initializing ${APP_NAME} extension...`)

    // 1. 基础服务
    Container.set(TOKENS.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    // 2. 功能服务
    Container.set(TOKENS.StatusBar, Container.get(StatusBarManager))
    Container.set(TOKENS.GitManager, Container.get(VscodeGit))
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
    Container.set(TOKENS.CommitMessageStore, Container.get(CommitMessageStore))
    Container.set(TOKENS.GitCommitManager, Container.get(GitCommitManager))
    Container.set(TOKENS.WebviewManager, Container.get(WebviewManager))
    Container.set(
      TOKENS.WebviewMessageHandler,
      Container.get(WebviewMessageHandler)
    )
    Container.set(TOKENS.PreferenceMonitor, Container.get(PreferenceMonitor))
    Container.set(TOKENS.Orchestrator, Container.get(Orchestrator))
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
