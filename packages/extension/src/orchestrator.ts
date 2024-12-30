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

import type {
  ICommitManager,
  IConfig,
  IInputOptions,
  ILogger,
} from "@shared/common"
import type { IGitCommitManager } from "@shared/server"

import type { IVscodeGit } from "@/vscode-git"
import type { IStatusBarManager } from "@/vscode-statusbar"
import { TOKENS } from "@/vscode-tokens"
import type { IWebviewManager } from "@/vscode-webview"

import type { IWorkspaceSettings } from "./vscode-settings"
import type { IWebviewMessageHandler } from "./vscode-webview-message-handler"

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
  readonly workspaceSettings: IWorkspaceSettings

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
  handleWebviewMessage(message: any): Promise<void>

  // 业务流程
  generateCommit(): Promise<void>
  quickCommit(): Promise<void>

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
    @Inject(TOKENS.Settings)
    public readonly workspaceSettings: IWorkspaceSettings
  ) {}

  async initialize(): Promise<void> {
    this.logger.info("Initializing Orchestrator...")

    // 注册所有事件监听
    this.webviewManager.setMessageHandler(this.webviewMessageHandler)

    // 监听工作区变化
    this.workspaceSettings.onSettingChange((section, value) => {
      void this.webviewManager.postMessage({
        type: "settings-updated",
        data: { section, value },
      })
    })

    // 初始化状态栏
    const model = this.gitCommitManager.model
    if (model) {
      await this.statusBar.setModel({ name: model.name })
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

  async handleWebviewMessage(message: any): Promise<void> {
    this.logger.info("Received message from webview:", message)
    // 处理来自 webview 的消息
    switch (message.type) {
      case "commit":
        await this.quickCommit()
        break
      // 其他消息类型...
    }
  }

  async generateCommit(): Promise<void> {
    const diff = await this.getDiff()
    if (!diff.changed) {
      await this.showMessage("No changes to commit")
      return
    }

    const options: IInputOptions = {
      lang: this.config.get<string>("ohMyCommit.git.commitLanguage"),
    }

    const result = await this.gitCommitManager.generateCommitWithDiff(
      diff,
      options
    )
    await this.updateWebview(result)
  }

  async quickCommit(): Promise<void> {
    try {
      await this.updateStatusBar("Generating commit message...")
      await this.generateCommit()
    } catch (error) {
      this.logger.error("Failed to quick commit:", error)
      await this.showMessage("Failed to generate commit message", "error")
    } finally {
      await this.updateStatusBar("")
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
