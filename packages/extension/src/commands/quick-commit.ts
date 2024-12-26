/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  COMMAND_QUICK_COMMIT,
  TOKENS,
  type CommitManager,
  type ServerMessageEvent,
} from "@shared/common"

import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"
import { VscodeGit } from "@/vscode-git"
import { VSCODE_TOKENS } from "@/vscode-token"
import { VscodeWebview } from "@/vscode-webview"

@Service()
export class QuickCommitCommand implements BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"

  constructor(
    @Inject(VSCODE_TOKENS.Context) private readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(VSCODE_TOKENS.Git) private readonly gitService: VscodeGit,
    @Inject(VSCODE_TOKENS.Webview) private readonly webviewManager: VscodeWebview,
  ) {
    // 设置 webview 的消息处理
    this.webviewManager.setMessageHandler(async message => {
      switch (message.type) {
        case "init":
          await this.syncFilesAndCommits()
          break

        case "selected-files":
          await this.syncFilesAndCommits(message.data)
          break

        case "commit":
          // todo
          break
      }
    })

    // Clean up file watcher when extension is deactivated
    this.context.subscriptions.push(this)
  }

  public dispose(): void {
    this.webviewManager?.dispose()
  }

  async execute(): Promise<void> {
    await this.webviewManager?.createWebviewPanel()
  }

  private async getLatestDiff(selectedFiles?: string[]) {
    this.logger.info("Getting latest diff, selectedFiles:", selectedFiles)
    await this.gitService.stageAll()
    const diffResult = await this.gitService.getDiffResult()
    this.logger.info("Done Getting Latest diff: ", diffResult)
    if (!selectedFiles) return diffResult

    const newDiffSummary: DiffResult = {
      changed: selectedFiles.length,
      deletions: 0,
      insertions: 0,
      files: [],
    }

    diffResult.files.forEach(file => {
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

  private async syncFilesAndCommits(selectedFiles?: string[]) {
    const diff = await this.getLatestDiff(selectedFiles)
    if (!selectedFiles) {
      await this.webviewManager?.postMessage({
        type: "diff-result",
        data: diff,
      })
    }

    this.logger.info("[QuickCommit] Generating commit via acManager...")
    const commit = await this.commitManager.generateCommit(diff)

    const data: ServerMessageEvent = {
      type: "commit-message",
      data: commit,
    }
    this.logger.info("[QuickCommit] Generated commit via acManager:", data)

    await this.webviewManager?.postMessage(data)
  }
}
