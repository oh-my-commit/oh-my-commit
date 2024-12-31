/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import "reflect-metadata"

import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import * as vscode from "vscode"

import { APP_NAME, Inject, formatError } from "@shared/common"
import { GitCommitManager, ProviderRegistry } from "@shared/server"

import { Orchestrator } from "@/managers/orchestrator"
import { VscodeGit } from "@/managers/vscode-git"
import { VscodeLogger } from "@/managers/vscode-logger"
import { VscodePreference } from "@/managers/vscode-preference"
import { PreferenceMonitor } from "@/managers/vscode-preference-monitor"
import { StatusBarManager } from "@/managers/vscode-statusbar"
import { TOKENS } from "@/managers/vscode-tokens"
import { WebviewManager } from "@/webview/vscode-webview"
import { WebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

import { CommitMessageStore } from "./managers/commit-message-store"
import { CommandManager } from "./managers/vscode-command-manager"

export function activate(context: vscode.ExtensionContext) {
  Inject(TOKENS.Config, VscodePreference)
  const logger = Inject(TOKENS.Logger, VscodeLogger)
  logger.info(`Initializing ${APP_NAME} extension...`)

  try {
    // 确保 provider 目录存在
    const providerDir = path.join(os.homedir(), ".oh-my-commit/providers/official")
    if (!fs.existsSync(providerDir)) {
      fs.mkdirSync(providerDir, { recursive: true })
    }

    // 复制内置的 provider 文件到用户目录
    const builtinProviderPath = path.join(context.extensionPath, "dist/providers/official")
    if (fs.existsSync(builtinProviderPath)) {
      fs.cpSync(builtinProviderPath, providerDir, { recursive: true })
      logger.info("Successfully installed official provider")
    }

    Inject(TOKENS.Context, context)
    Inject(TOKENS.StatusBar, StatusBarManager)
    Inject(TOKENS.GitManager, VscodeGit)
    Inject(TOKENS.ProviderManager, ProviderRegistry)
    Inject(TOKENS.CommitMessageStore, CommitMessageStore)
    Inject(TOKENS.GitCommitManager, GitCommitManager)
    Inject(TOKENS.WebviewManager, WebviewManager)
    Inject(TOKENS.WebviewMessageHandler, WebviewMessageHandler)
    Inject(TOKENS.PreferenceMonitor, PreferenceMonitor)
    Inject(TOKENS.Orchestrator, Orchestrator)
    Inject(TOKENS.CommandManager, CommandManager)

    context.subscriptions.push({ dispose: () => {} })
  } catch (error: unknown) {
    logger.error(formatError(error, `Failed to initialize Oh My Commit: ${error as string}`))
    void vscode.window.showErrorMessage(formatError(error, `Failed to initialize Oh My Commit`))
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
