/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { DiffResult } from "simple-git"
import Container, { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  COMMAND_QUICK_COMMIT,
  type CommitManager,
  IInputOptions,
  IResult,
  ResultDTO,
} from "@shared/common"

import { WebviewMessageHandler } from "@/WebviewMessageHandler"
import type { BaseCommand } from "@/vscode-command"
import { VscodeConfig, VscodeLogger } from "@/vscode-commit-adapter"
import { VscodeGit } from "@/vscode-git"
import { StatusBarManager } from "@/vscode-statusbar"
import { TOKENS } from "@/vscode-token"
import { VscodeWebview } from "@/vscode-webview"

@Service()
export class QuickCommitCommand implements BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"
  private commit: ResultDTO<IResult> | null = null
  private isWebviewInitialized = false

  constructor(
    @Inject(TOKENS.Context)
    private readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(TOKENS.GitManager) private readonly gitService: VscodeGit,

    @Inject(TOKENS.Config)
    private readonly config: VscodeConfig,

    @Inject(TOKENS.Webview)
    private readonly webviewManager: VscodeWebview,

    @Inject(TOKENS.StatusBar)
    private readonly statusBar: StatusBarManager
  ) {
    // 监听配置变更
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("ohMyCommit.git.commitLanguage")) {
          const config = vscode.workspace.getConfiguration("ohMyCommit")
          const value = config.get("git.commitLanguage")
          void this.webviewManager?.postMessage({
            type: "settings-updated",
            data: {
              section: "git.commitLanguage",
              value,
            },
          })
        }
      })
    )

    // Subscribe to git changes
    this.gitService.onGitStatusChanged(async () => {
      this.logger.info(
        "[QuickCommit] Git status changed, syncing files and commits..."
      )
      await this.syncFiles()
    })

    // 设置 webview 的消息处理
    this.webviewManager.setMessageHandler(Container.get(WebviewMessageHandler))

    // Clean up file watcher when extension is deactivated
    this.context.subscriptions.push(this)
  }

  public dispose(): void {
    // this.webviewManager?.dispose()
  }

  async genCommit(): Promise<ResultDTO<IResult>> {
    const diff = await this.getLatestDiff()

    if (!diff.changed) {
      this.logger.info(
        "[QuickCommit] No changes to commit, skipping commit generation"
      )
      return {
        ok: false,
        code: 500,
        message: "No changes to commit",
      }
    }

    const options: IInputOptions = {
      lang: this.config.get<string>("ohMyCommit.git.commitLanguage"),
    }
    this.logger.info("[QuickCommit] Generating commit via acManager: ", {
      options,
    })
    const commit = await this.commitManager.generateCommit(diff, options)
    this.logger.info("[QuickCommit] Generated commit via acManager:", commit)
    this.commit = commit
    return commit
  }

  async execute(): Promise<void> {
    this.statusBar.setWaiting("Generating commit message...")
    const commit = await this.genCommit()
    this.statusBar.clearWaiting()

    const uiMode = this.config.get<string>("ohMyCommit.ui.mode") || "panel"
    this.logger.info("[QuickCommit] UI mode:", uiMode)

    // Concurrently create webview panel and show notification
    await Promise.all([
      // Create and update webview panel
      (async () => {
        await this.syncCommitMessage()
      })(),
      // Show notification and handle user interaction
      (async () => {
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
          { modal: false, detail: commit.data.body },
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

  /**
   * @param selectedFiles: todo (maybe not used)
   * @returns
   */
  private async getLatestDiff(selectedFiles?: string[]) {
    this.logger.debug("Getting latest diff, selectedFiles:", selectedFiles)
    await this.gitService.stageAll()
    const diffResult = await this.gitService.getDiffResult()
    this.logger.debug("Done Getting Latest diff: ", diffResult)
    if (!selectedFiles) return diffResult

    const newDiffSummary: DiffResult = {
      changed: selectedFiles.length,
      deletions: 0,
      insertions: 0,
      files: [],
    }

    diffResult.files.forEach((file) => {
      if (selectedFiles.includes(file.file)) {
        if (!file.binary) {
          newDiffSummary.insertions += file.insertions
          newDiffSummary.deletions += file.deletions
        }
      }
    })
    this.logger.info("New Diff Summary: ", newDiffSummary)

    return newDiffSummary
  }

  private async syncCommitMessage() {
    if (!this.commit || !this.isWebviewInitialized) return
    await this.webviewManager.postMessage({
      type: "commit-message",
      data: this.commit,
    })
    this.commit = null
  }

  private async syncFiles() {
    await this.webviewManager?.postMessage({
      type: "diff-result",
      data: await this.getLatestDiff(),
    })
  }
}
