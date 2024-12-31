/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import vscode from "vscode"

import type { ICommitManager, ILogger, IPreference, IProviderManager, UiMode } from "@shared/common"
import type { IGitCommitManager } from "@shared/server"

import type { IVscodeGit } from "@/managers/vscode-git"
import type { IPreferenceMonitor } from "@/managers/vscode-preference-monitor"
import type { IStatusBarManager } from "@/managers/vscode-statusbar"
import { TOKENS } from "@/managers/vscode-tokens"
import type { IWebviewManager } from "@/webview/vscode-webview"
import type { IWebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

import type { ICommitMessageStore } from "./commit-message-store"
import { CommandManager } from "./vscode-command-manager"

export interface IOrchestrator {
  // 基础服务
  readonly context: vscode.ExtensionContext
  readonly logger: ILogger
  readonly config: IPreference

  // 管理的服务
  readonly gitService: IVscodeGit
  readonly webviewManager: IWebviewManager
  readonly gitCommitManager: ICommitManager
  readonly statusBar: IStatusBarManager
  readonly workspaceSettings: IPreferenceMonitor

  // Git 相关操作
  commit(message: string): Promise<void>

  // 业务流程
  generateCommit(): Promise<void>

  // 生命周期
  initialize(): Promise<void>
  dispose(): void
}

@Service()
export class Orchestrator implements IOrchestrator {
  constructor(
    @Inject(TOKENS.Context) public readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.Logger) public readonly logger: ILogger,
    @Inject(TOKENS.Preference) public readonly config: IPreference,
    @Inject(TOKENS.GitCommitManager)
    public readonly gitCommitManager: IGitCommitManager,
    @Inject(TOKENS.StatusBar) public readonly statusBar: IStatusBarManager,
    @Inject(TOKENS.GitManager) public readonly gitService: IVscodeGit,
    @Inject(TOKENS.ProviderManager)
    public readonly providerManager: IProviderManager,
    @Inject(TOKENS.WebviewMessageHandler)
    public readonly webviewMessageHandler: IWebviewMessageHandler,
    @Inject(TOKENS.WebviewManager)
    public readonly webviewManager: IWebviewManager,
    @Inject(TOKENS.PreferenceMonitor)
    public readonly workspaceSettings: IPreferenceMonitor,
    @Inject(TOKENS.CommitMessageStore)
    private readonly commitMessageStore: ICommitMessageStore
  ) {
    void this.initialize()
  }

  async initialize(): Promise<void> {
    this.logger.info("Initializing Orchestrator...")

    // 注册所有事件监听
    this.webviewManager.setMessageHandler(this.webviewMessageHandler)

    // 监听工作区变化
    this.workspaceSettings.onPreferenceChange((section, value) => {
      void this.webviewManager.postMessage({
        type: "settings-updated",
        data: { section, value },
      })
    })

    // 初始化状态栏
    const model = this.gitCommitManager.model
    if (model) {
      this.statusBar.setModel({ name: model.name })
    }

    this.providerManager
      .initialize()
      .then(() => {
        this.logger.debug("Provider initialization complete")
        // Notify StatusBar to update if needed
        void this.statusBar.setModel({
          name: this.gitCommitManager.model!.name,
        })
      })
      .catch((error) => {
        this.logger.error("Failed to initialize providers:", error)
      })

    this.logger.info("Orchestrator initialized")
  }

  async commit(message: string): Promise<void> {
    try {
      this.statusBar.setWaiting("Committing...")
      await this.gitService.commit(message)
    } finally {
      this.statusBar.clearWaiting()
    }
  }

  async generateCommit(): Promise<void> {
    const postGenerateCommit = async (uiMode: UiMode) => {
      const result = this.commitMessageStore.getResult()
      if (!result) return
      switch (uiMode) {
        case "notification":
          if (result.ok) {
            const selection = await vscode.window.showInformationMessage(
              result.data.title,
              { modal: false },
              "Commit",
              "Edit"
            )

            if (selection === "Commit") {
              await this.commit(result.data.title)
              await vscode.window.showInformationMessage("Successfully commited")
            } else if (selection === "Edit") {
              this.webviewManager.show()
            }
          } else {
            await vscode.window.showErrorMessage(`Failed to generate message, reason: ${result.message}`)
          }
          break

        case "panel":
          this.webviewManager.postMessage({
            type: "generate-result",
            data: result,
          })
          break
      }
    }

    try {
      this.statusBar.setWaiting("Generating commit...")
      const result = await this.gitCommitManager.generateCommit()
      this.commitMessageStore.setResult(result)
      await Promise.all([postGenerateCommit("notification"), postGenerateCommit("panel")])
    } finally {
      this.statusBar.clearWaiting()
    }
  }

  async dispose(): Promise<void> {
    this.logger.info("Disposing Orchestrator...")
    // todo
    this.logger.info("Orchestrator disposed")
  }
}
