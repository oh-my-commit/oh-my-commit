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

import { VscodeConfig } from "@/vscode-config"
import { VscodeLogger } from "@/vscode-logger"

import { CommandManager } from "./command-manager"
import { Orchestrator } from "./orchestrator"
import { VscodeGit } from "./vscode-git"
import { VscodeSettings } from "./vscode-settings"
import { StatusBarManager } from "./vscode-statusbar"
import { TOKENS } from "./vscode-tokens"
import { WebviewManager } from "./vscode-webview"
import { WebviewMessageHandler } from "./vscode-webview-message-handler"

export function activate(context: vscode.ExtensionContext) {
  const logger = Container.get(VscodeLogger)
  try {
    logger.info(`Initializing ${APP_NAME} extension...`)

    // 1. 基础服务
    Container.set(TOKENS.Context, context)
    Container.set(TOKENS.Logger, logger)
    Container.set(TOKENS.Config, Container.get(VscodeConfig))

    // 2. 功能服务
    logger.info("setting status bar...")
    Container.set(TOKENS.StatusBar, Container.get(StatusBarManager))

    logger.info("setting git manager...")
    Container.set(TOKENS.GitManager, Container.get(VscodeGit))

    logger.info("setting provider manager...")
    Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))

    logger.info("setting commit manager...")
    Container.set(TOKENS.GitCommitManager, Container.get(GitCommitManager))

    logger.info("setting webview...")
    const webviewManager = Container.get(WebviewManager)
    Container.set(TOKENS.WebviewManager, webviewManager)

    logger.info("setting webview message handler...")
    const messageHandler = Container.get(WebviewMessageHandler)
    Container.set(TOKENS.WebviewMessageHandler, messageHandler)
    webviewManager.setMessageHandler(messageHandler)

    // 4. 依赖 Orchestrator 的服务
    logger.info("setting settings...")
    Container.set(TOKENS.Settings, Container.get(VscodeSettings))

    logger.info("setting orchestrator...")
    const orchestrator = Container.get(Orchestrator)
    Container.set(TOKENS.Orchestrator, orchestrator)
    void orchestrator.initialize()

    // 5. 异步初始化
    logger.info("Initializing providers...")
    // Initialize providers asynchronously
    Container.get(ProviderRegistry)
      .initialize()
      .then(() => {
        logger.debug("Provider initialization complete")
        // Notify StatusBar to update if needed
        void Container.get(StatusBarManager).setModel({
          name: Container.get(TOKENS.GitCommitManager).model!.name,
        })
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
