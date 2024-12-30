/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import type { DiffResult } from "simple-git"
import { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { ClientMessageEvent, CommitManager, formatError } from "@shared/common"

import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VscodeGit } from "./vscode-git.js"
import { TOKENS } from "./vscode-token"
import { VscodeWebview } from "./vscode-webview"

@Service()
export class WebviewMessageHandler {
  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(TOKENS.GitManager) private readonly gitService: VscodeGit,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    private readonly webview: VscodeWebview
  ) {}

  async handleMessage(message: ClientMessageEvent): Promise<void> {
    switch (message.type) {
      case "init":
        await this.handleInit()
        break

      case "show-info":
        void vscode.window.showInformationMessage(message.data.message)
        break

      case "open-external":
        void vscode.env.openExternal(vscode.Uri.parse(message.data.url))
        break

      case "get-settings":
        await this.handleGetSettings(message)
        break

      case "update-settings":
        await this.handleUpdateSettings(message)
        break

      case "commit":
        await this.handleCommit(message)
        break

      case "diff-file":
        await this.handleDiffFile(message)
        break

      case "execute-command":
        await this.handleExecuteCommand(message)
        break
    }
  }

  private async handleInit() {
    await this.syncWorkspaceStatus()
    await this.syncFiles()
  }

  private async handleGetSettings(message: ClientMessageEvent) {
    if (message.type !== "get-settings") return

    try {
      const config = vscode.workspace.getConfiguration("ohMyCommit")
      const value = config.get(message.data.section)
      await this.webview.postMessage({
        type: "settings-value",
        data: {
          section: message.data.section,
          value,
        },
      })
    } catch (error) {
      this.logger.error(
        "[WebviewMessageHandler] Failed to get settings:",
        error
      )
    }
  }

  private async handleUpdateSettings(message: ClientMessageEvent) {
    if (message.type !== "update-settings") return

    try {
      const config = vscode.workspace.getConfiguration("ohMyCommit")
      const section = message.data.section.startsWith("ohMyCommit.")
        ? message.data.section
        : `ohMyCommit.${message.data.section}`

      await vscode.workspace
        .getConfiguration()
        .update(section, message.data.value, vscode.ConfigurationTarget.Global)

      await this.webview.postMessage({
        type: "settings-updated",
        data: {
          section: message.data.section,
          value: message.data.value,
        },
      })
    } catch (error) {
      this.logger.error(
        "[WebviewMessageHandler] Failed to update settings:",
        error
      )
    }
  }

  private async handleCommit(message: ClientMessageEvent) {
    if (message.type !== "commit") return

    this.logger.info(
      "[WebviewMessageHandler] Committing changes with message:",
      message.data
    )
    try {
      const { title, body } = message.data
      const commitMessage = body ? `${title}\n\n${body}` : title

      await this.gitService.stageAll()

      if (!(await this.gitService.hasChanges())) {
        throw new Error("No changes to commit")
      }

      await this.gitService.commit(commitMessage)

      await this.webview.postMessage({
        type: "commit-result",
        data: {
          ok: true,
          data: { message: "Changes committed successfully" },
        },
      })

      void vscode.window.showInformationMessage(
        "Changes committed successfully"
      )
      await this.syncFiles()
    } catch (error) {
      this.logger.error(
        "[WebviewMessageHandler] Failed to commit changes:",
        error
      )

      await this.webview.postMessage({
        type: "commit-result",
        data: {
          ok: false,
          code: 500,
          message: formatError(error, "Failed to commit changes"),
        },
      })

      void vscode.window.showErrorMessage(
        formatError(error, "Failed to commit changes")
      )
    }
  }

  private async handleDiffFile(message: ClientMessageEvent) {
    if (message.type !== "diff-file") return

    try {
      const diffResult = await this.gitService.getFileDiffDetail(
        message.data.filePath
      )
      await this.webview.postMessage({
        type: "diff-file-result",
        data: {
          ok: true,
          data: {
            diff: diffResult,
          },
        },
      })
    } catch (error) {
      this.logger.error("[WebviewMessageHandler] Failed to get diff:", error)
      await this.webview.postMessage({
        type: "diff-file-result",
        data: {
          ok: false,
          code: 500,
          message: formatError(error, "Failed to get diff"),
        },
      })
    }
  }

  private async handleExecuteCommand(message: ClientMessageEvent) {
    if (message.type !== "execute-command") return

    try {
      await vscode.commands.executeCommand(message.command, message.data)
    } catch (error) {
      this.logger.error(
        "[WebviewMessageHandler] Failed to execute command:",
        error
      )
    }
  }

  private async syncFiles() {
    const diffResult = await this.getDiffResult()
    await this.webview.postMessage({
      type: "diff-result",
      data: diffResult,
    })
  }

  private async getDiffResult(selectedFiles?: string[]) {
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

  private async syncWorkspaceStatus() {
    const workspaceFolders = vscode.workspace.workspaceFolders
    const workspaceRoot = workspaceFolders
      ? workspaceFolders[0]?.uri.fsPath
      : undefined
    const isWorkspaceValid = !!(
      workspaceRoot && vscode.workspace.fs.stat(vscode.Uri.file(workspaceRoot))
    )

    void this.webview.postMessage({
      type: "workspace-status",
      data: {
        workspaceRoot,
        isWorkspaceValid,
        isGitRepository: await this.gitService.isGitRepository(),
        error: !workspaceRoot
          ? "请打开一个工作区文件夹"
          : !isWorkspaceValid
            ? "工作区文件夹不存在或已被删除"
            : undefined,
      },
    })
  }
}
