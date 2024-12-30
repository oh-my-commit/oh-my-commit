/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import type * as vscode from "vscode"

import { APP_NAME } from "@shared/common"
import { GitCommitManager, ProviderRegistry } from "@shared/server"

import { CommitMessageStore } from "@/managers/commit-message-store"
import { Orchestrator } from "@/managers/orchestrator"
import { VscodeConfig } from "@/managers/vscode-config"
import { VscodeGit } from "@/managers/vscode-git"
import { VscodeLogger } from "@/managers/vscode-logger"
import { PreferenceMonitor } from "@/managers/vscode-preference-monitor"
import { StatusBarManager } from "@/managers/vscode-statusbar"
import { TOKENS } from "@/managers/vscode-tokens"
import { WebviewManager } from "@/webview/vscode-webview"
import { WebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

@Service()
export class ExtensionBootstrap {
  constructor(
    @Inject(TOKENS.Context) private context: vscode.ExtensionContext,
    private logger: VscodeLogger,
    private config: VscodeConfig,
    private statusBar: StatusBarManager,
    private git: VscodeGit,
    private providerRegistry: ProviderRegistry,
    private commitMessageStore: CommitMessageStore,
    private gitCommitManager: GitCommitManager,
    private webviewManager: WebviewManager,
    private webviewMessageHandler: WebviewMessageHandler,
    private preferenceMonitor: PreferenceMonitor,
    private orchestrator: Orchestrator
  ) {}

  async initialize(): Promise<void> {
    this.logger.info(`Initializing ${APP_NAME} extension...`)

    try {
      // 启动各个服务
      await this.orchestrator.initialize()

      this.logger.info(`${APP_NAME} extension initialized successfully`)
    } catch (error) {
      this.logger.error(`Failed to initialize ${APP_NAME} extension:`, error)
      throw error
    }
  }

  dispose(): void {
    // 清理资源
    this.statusBar.dispose()
    this.preferenceMonitor.dispose()
    void this.orchestrator.dispose()
  }
}
