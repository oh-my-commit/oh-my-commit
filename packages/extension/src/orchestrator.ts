/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import vscode from "vscode"

import type {
  ICommitManager,
  IConfig,
  IInputOptions,
  ILogger,
  IResult,
  ResultDTO,
  ServerMessageEvent,
} from "@shared/common"

import type { IVscodeGit } from "@/vscode-git"
import type { IStatusBarManager } from "@/vscode-statusbar"
import { TOKENS } from "@/vscode-token"
import type { IWebviewManager } from "@/vscode-webview"

export interface IOrchestrator {
  gitService: IVscodeGit

  webviewManager: IWebviewManager

  commitManager: ICommitManager

  statusBar: IStatusBarManager

  logger: ILogger

  config: IConfig

  context: vscode.ExtensionContext

  syncFiles(): Promise<void>

  syncCommitMessage(): Promise<void>

  diffAndCommit(): Promise<void>

  onWorkspaceChange(): Promise<void>

  postMessage: (message: ServerMessageEvent) => Promise<void>
}

@Service()
export class Orchestrator implements IOrchestrator {
  private isWebviewInitialized = false
  private commit: ResultDTO<IResult> | null = null

  constructor(
    @Inject(TOKENS.Context) public readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.Logger) public readonly logger: ILogger,
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.StatusBar) public readonly statusBar: IStatusBarManager,
    @Inject(TOKENS.CommitManager) public readonly commitManager: ICommitManager,
    @Inject(TOKENS.GitManager) public readonly gitService: IVscodeGit,
    @Inject(TOKENS.Webview) public readonly webviewManager: IWebviewManager
  ) {}

  async postMessage(message: ServerMessageEvent): Promise<void> {
    void this.webviewManager.postMessage(message)
  }

  async diffAndCommit(): Promise<void> {
    this.statusBar.setWaiting("Generating commit message...")
    const diff = await this.gitService.getDiffResult()

    if (!diff.changed) {
      this.logger.info(
        "[QuickCommit] No changes to commit, skipping commit generation"
      )
      void vscode.window.showInformationMessage("No changes to commit")
      return
    }

    const options: IInputOptions = {
      lang: this.config.get<string>("ohMyCommit.git.commitLanguage"),
    }
    this.logger.info("[QuickCommit] Generating commit via acManager: ", {
      options,
    })
    const commit = await this.commitManager.generateCommit(diff, options)
    this.commit = commit
    this.logger.info("[QuickCommit] Generated commit via acManager:", commit)
    this.statusBar.clearWaiting()

    const uiMode = this.config.get<string>("ohMyCommit.ui.mode") || "panel"
    this.logger.info("[QuickCommit] UI mode:", uiMode)

    // Concurrently create webview panel and show notification
    await Promise.all([
      // Create and update webview panel
      (async (): Promise<void> => {
        await this.syncCommitMessage()
      })(), // Show notification and handle user interaction
      (async (): Promise<void> => {
        if (uiMode !== "notification") return

        this.logger.info("[QuickCommit] showing commit message notification...")

        if (!commit.ok) {
          void vscode.window.showErrorMessage(
            `Failed to generate commit! Reason: ${commit.message}`
          )
          return
        }

        const result = await vscode.window.showInformationMessage(
          commit.data.title,
          {
            modal: false,
            detail: commit.data.body,
          },
          "Commit",
          "Edit"
          // "Cancel" // 有 x 不需要
        )

        if (result === "Commit") {
          // Direct commit
          await this.gitService.stageAll()
          if (!(await this.gitService.hasChanges())) {
            void vscode.window.showErrorMessage("No changes to commit")
            return
          }
          const commitMessage = commit.data.body
            ? `${commit.data.title}\n\n${commit.data.body}`
            : commit.data.title
          await this.gitService.commit(commitMessage)
          void vscode.window.showInformationMessage(
            "Changes committed successfully"
          )
          await this.syncFiles()
        } else if (result === "Edit") {
          this.logger.info("[QuickCommit] user selected to edit commit message")
          await this.webviewManager.show()
        }
        // Note: No need to handle "Edit" case since webview panel is already created
      })(),
    ])
  }

  async onWorkspaceChange(): Promise<void> {}

  async syncCommitMessage() {
    if (!this.commit || !this.isWebviewInitialized) return
    this.webviewManager.postMessage({
      type: "commit-message",
      data: this.commit,
    })
    this.commit = null
  }

  async syncFiles() {
    this.webviewManager?.postMessage({
      type: "diff-result",
      data: await this.gitService.getDiffResult(),
    })
  }
}
