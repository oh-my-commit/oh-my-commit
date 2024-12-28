/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  APP_ID_CAMEL,
  APP_NAME,
  BaseLogger,
  COMMAND_SELECT_MODEL,
  CommitManager,
} from "@shared/common"

import { VscodeGit } from "./vscode-git"
import { TOKENS } from "./vscode-token"

@Service()
export class StatusBarManager implements vscode.Disposable {
  private disposables: vscode.Disposable[] = []
  private statusBarItem: vscode.StatusBarItem
  private previousState?: {
    text: string
    tooltip?: string
    command?: string
  }

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: BaseLogger,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(TOKENS.GitManager) private readonly gitService: VscodeGit
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    )
    this.statusBarItem.name = APP_NAME

    // 设置初始状态
    this.statusBarItem.text = `$(sync~spin) (Initializing...)`
    this.statusBarItem.show()

    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(APP_ID_CAMEL)) {
          void this.update()
        }
      })
    )

    // 监听工作区变化（可能影响 git 状态）
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        void this.update()
      })
    )

    void this.update()
  }

  public setWaiting(message: string = "Generating commit...") {
    // Save current state
    this.previousState = {
      text: this.statusBarItem.text,
      tooltip: this.statusBarItem.tooltip,
      command:
        typeof this.statusBarItem.command === "string"
          ? this.statusBarItem.command
          : undefined,
    }

    // Set waiting state
    this.statusBarItem.text = `$(sync~spin) (${message})`
    this.statusBarItem.tooltip = message
    this.statusBarItem.command = undefined
  }

  public clearWaiting() {
    if (this.previousState) {
      this.statusBarItem.text = this.previousState.text
      this.statusBarItem.tooltip = this.previousState.tooltip
      this.statusBarItem.command = this.previousState.command
      this.previousState = undefined
    } else {
      void this.update()
    }
  }

  public async update(): Promise<void> {
    try {
      if (!this.commitManager?.providersManager) {
        this.statusBarItem.text = `$(error) (Initializing...)`
        this.statusBarItem.tooltip = "Provider manager is not initialized"
        this.statusBarItem.command = undefined
        return
      }

      const model = this.commitManager.model
      // this.logger.debug(`Updating status: `, { modelId, model })
      const isGitRepo = await this.gitService.isGitRepository()

      if (!isGitRepo) {
        this.statusBarItem.text = `$(error) (Not a Git repository)`
        this.statusBarItem.tooltip = "This workspace is not a Git repository"
        this.statusBarItem.command = undefined
        return
      }

      if (!model) {
        this.statusBarItem.text = `$(error) (No model selected)`
        this.statusBarItem.tooltip = "Click to select a model"
        this.statusBarItem.command = COMMAND_SELECT_MODEL
        return
      }

      this.statusBarItem.text = `$(git-commit) (${model.name})`
      this.statusBarItem.tooltip = `Current model: ${model.name}\nClick to change model`
      this.statusBarItem.command = COMMAND_SELECT_MODEL
    } catch (error) {
      this.logger.error("Error updating status bar:", error)
      this.statusBarItem.text = `$(error) (Error)`
      this.statusBarItem.tooltip =
        "Error updating status. Check logs for details."
      this.statusBarItem.command = undefined
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose()
    this.disposables.forEach((d) => d.dispose())
  }
}
