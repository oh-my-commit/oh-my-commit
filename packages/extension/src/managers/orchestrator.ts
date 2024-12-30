/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import vscode from "vscode"

import type { ICommitManager, IConfig, ILogger, UiMode } from "@shared/common"
import type { IGitCommitManager } from "@shared/server"

import type { IVscodeGit } from "@/managers/vscode-git"
import type { IPreferenceMonitor } from "@/managers/vscode-preference-monitor"
import type { IStatusBarManager } from "@/managers/vscode-statusbar"
import { TOKENS } from "@/managers/vscode-tokens"
import type { IWebviewManager } from "@/webview/vscode-webview"
import type { IWebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

import type { ICommitMessageStore } from "./commit-message-store"

export interface IOrchestrator {
  // 基础服务
  readonly context: vscode.ExtensionContext
  readonly logger: ILogger
  readonly config: IConfig

  // 管理的服务
  readonly gitService: IVscodeGit
  readonly webviewManager: IWebviewManager
  readonly gitCommitManager: ICommitManager
  readonly statusBar: IStatusBarManager
  readonly workspaceSettings: IPreferenceMonitor

  // Git 相关操作
  getDiff(): Promise<DiffResult>
  commit(message: string): Promise<void>

  // UI 相关操作
  showMessage(
    message: string,
    type?: "info" | "warning" | "error"
  ): Promise<void>
  updateStatusBar(message: string): Promise<void>

  // Webview 相关操作
  updateWebview(data: any): Promise<void>
  // handleWebviewMessage(message: any): Promise<void>

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
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.GitCommitManager)
    public readonly gitCommitManager: IGitCommitManager,
    @Inject(TOKENS.StatusBar) public readonly statusBar: IStatusBarManager,
    @Inject(TOKENS.GitManager) public readonly gitService: IVscodeGit,
    @Inject(TOKENS.WebviewMessageHandler)
    public readonly webviewMessageHandler: IWebviewMessageHandler,
    @Inject(TOKENS.WebviewManager)
    public readonly webviewManager: IWebviewManager,
    @Inject(TOKENS.PreferenceMonitor)
    public readonly workspaceSettings: IPreferenceMonitor,
    @Inject(TOKENS.CommitMessageStore)
    private readonly commitMessageStore: ICommitMessageStore
  ) {}

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

    this.logger.info("Orchestrator initialized")
  }

  async getDiff(): Promise<DiffResult> {
    return this.gitService.getDiffResult()
  }

  async commit(message: string): Promise<void> {
    await this.gitService.commit(message)
    await this.updateStatusBar("Committed successfully")
  }

  async showMessage(
    message: string,
    type: "info" | "warning" | "error" = "info"
  ): Promise<void> {
    switch (type) {
      case "warning":
        void vscode.window.showWarningMessage(message)
        break
      case "error":
        void vscode.window.showErrorMessage(message)
        break
      default:
        void vscode.window.showInformationMessage(message)
    }
  }

  async updateStatusBar(message: string): Promise<void> {
    await this.statusBar.setText(message)
  }

  async updateWebview(data: any): Promise<void> {
    // todo
    // await this.webviewManager.postMessage({
    //   type: "update",
    //   data,
    // })
  }

  async handleSimpleGen() {
    const uiMode = this.config.get<UiMode>("ohMyCommit.ui.mode")!
    const result = this.commitMessageStore.getResult()
    if (!result || uiMode !== "notification") return

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
      await this.showMessage(
        `Failed to generate message, reason: ${result.message}`,
        "error"
      )
    }
  }

  async handleWebviewGen() {
    const result = this.commitMessageStore.getResult()
    if (!result) return
    this.webviewManager.postMessage({
      type: "generate-result",
      data: result,
    })
  }

  async generateCommit(): Promise<void> {
    try {
      this.statusBar.setWaiting("Generating commit...")
      const result = await this.gitCommitManager.generateCommit()
      this.commitMessageStore.setResult(result)
      await Promise.all([this.handleSimpleGen(), this.handleWebviewGen()])
    } finally {
      this.statusBar.clearWaiting()
    }
  }

  async syncFiles(): Promise<void> {
    const diffResult = await this.getDiff()
    void this.webviewManager.postMessage({
      type: "diff-result",
      data: diffResult,
    })
  }

  async dispose(): Promise<void> {
    this.logger.info("Disposing Orchestrator...")
    // todo
    this.logger.info("Orchestrator disposed")
  }
}
