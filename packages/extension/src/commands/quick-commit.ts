/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as path from "path"
import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  COMMAND_QUICK_COMMIT,
  ClientMessageEvent,
  type CommitManager,
  type ServerMessageEvent,
  TOKENS,
  formatError,
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
    @Inject(VSCODE_TOKENS.Context)
    private readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(VSCODE_TOKENS.Git) private readonly gitService: VscodeGit,
    @Inject(VSCODE_TOKENS.Webview)
    private readonly webviewManager: VscodeWebview
  ) {
    // 设置 webview 的消息处理
    this.webviewManager.setMessageHandler(
      async (message: ClientMessageEvent) => {
        switch (message.type) {
          case "init":
            await this.syncFilesAndCommits()
            break

          case "show-info":
            vscode.window.showInformationMessage(message.data.message)
            break

          case "regenerate-commit":
            if (message.data.requestStagedFiles) {
              await this.syncFilesAndCommits()
            }
            break

          case "selected-files":
            await this.syncFilesAndCommits(message.data)
            break

          case "commit":
            this.logger.info(
              "[VscodeWebview] Committing changes with message:",
              message.data
            )
            try {
              const { title, body } = message.data
              const commitMessage = body ? `${title}\n\n${body}` : title

              // Ensure changes are staged
              await this.gitService.stageAll()

              // Check if there are changes to commit
              if (!(await this.gitService.hasChanges())) {
                throw new Error("No changes to commit")
              }

              // Perform the commit
              await this.gitService.commit(commitMessage)

              // Send success response
              await this.webviewManager?.postMessage({
                type: "commit-result",
                data: {
                  ok: true,
                  data: { message: "Changes committed successfully" },
                },
              })

              // Show success message
              vscode.window.showInformationMessage(
                "Changes committed successfully"
              )

              // Refresh git status
              await this.syncFilesAndCommits()
            } catch (error) {
              this.logger.error(
                "[VscodeWebview] Failed to commit changes:",
                error
              )

              // Send error response
              await this.webviewManager?.postMessage({
                type: "commit-result",
                data: {
                  ok: false,
                  code: 500,
                  message: formatError(error, "Failed to commit changes"),
                },
              })

              // Show error message
              vscode.window.showErrorMessage(
                formatError(error, "Failed to commit changes")
              )
            }
            break

          case "diff-file":
            this.logger.info(
              "[VscodeWebview] Getting file diff for:",
              message.data.filePath
            )
            try {
              const workspaceRoot = this.gitService.workspaceRoot
              if (!workspaceRoot) {
                throw new Error("No workspace root found")
              }

              const filePath = message.data.filePath
              const absolutePath = path.isAbsolute(filePath)
                ? filePath
                : path.join(workspaceRoot, filePath)

              const uri = vscode.Uri.file(absolutePath)
              this.logger.info(
                "[VscodeWebview] Resolved file path:",
                uri.fsPath
              )

              // 获取 git 扩展
              const gitExtension =
                vscode.extensions.getExtension<any>("vscode.git")?.exports
              if (!gitExtension) {
                throw new Error("Git extension not found")
              }

              const git = gitExtension.getAPI(1)
              const repository = git.repositories[0]
              if (!repository) {
                throw new Error("No repository found")
              }

              // 打开差异视图
              await vscode.commands.executeCommand("git.openChange", uri)

              this.logger.info("[VscodeWebview] Opened file diff")
            } catch (error) {
              this.logger.error(
                "[VscodeWebview] Failed to get file diff:",
                error
              )
            }
            break
        }
      }
    )

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
