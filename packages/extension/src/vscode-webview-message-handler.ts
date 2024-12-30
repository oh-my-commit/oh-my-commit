/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import type { DiffResult } from "simple-git"
import path from "path"
import { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  ClientMessageEvent,
  clientMessageTips,
  formatError,
} from "@shared/common"
import type { IGitCommitManager } from "@shared/server/git-commit-manager"

import type { VscodeLogger } from "@/vscode-logger"

import type { VscodeGit } from "./vscode-git"
import type { IStatusBarManager } from "./vscode-statusbar"
import { TOKENS } from "./vscode-tokens"
import type { IWebviewManager } from "./vscode-webview"

export interface IWebviewMessageHandler {
  handleMessage(message: ClientMessageEvent): Promise<void>
}

@Service()
export class WebviewMessageHandler implements IWebviewMessageHandler {
  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.GitManager) private readonly gitService: VscodeGit,
    @Inject(TOKENS.GitCommitManager)
    private readonly gitCommitManager: IGitCommitManager,
    @Inject(TOKENS.WebviewManager)
    private readonly webviewManager: IWebviewManager,
    @Inject(TOKENS.StatusBar) private readonly statusBar: IStatusBarManager
  ) {}

  async handleMessage(message: ClientMessageEvent): Promise<void> {
    try {
      this.statusBar.setWaiting(clientMessageTips[message.type])
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

        case "generate":
          this.webviewManager.postMessage({
            type: "generate-result",
            data: await this.gitCommitManager.generateCommit(),
          })

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

        default:
          this.logger.error(`Unknown message type: ${message.type}`)
      }
    } finally {
      this.statusBar.clearWaiting()
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
      await this.webviewManager.postMessage({
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

      await this.webviewManager.postMessage({
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

      await this.webviewManager.postMessage({
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

      await this.webviewManager.postMessage({
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

    this.logger.info(
      "[VscodeWebview] Getting file diff for:",
      message.data.filePath
    )
    try {
      const workspaceRoot = this.gitService.workspaceRoot
      if (!workspaceRoot) return

      const filePath = message.data.filePath
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(workspaceRoot, filePath)

      const uri = vscode.Uri.file(absolutePath)
      this.logger.info("[VscodeWebview] Resolved file path:", uri.fsPath)

      // 获取 git 扩展
      const gitExtension =
        vscode.extensions.getExtension<any>("vscode.git")?.exports
      if (!gitExtension) return

      const git = gitExtension.getAPI(1)
      const repository = git.repositories[0]
      if (!repository) return

      // 打开差异视图
      await vscode.commands.executeCommand("git.openChange", uri)

      this.logger.info("[VscodeWebview] Opened file diff")
    } catch (error) {
      this.logger.error(
        formatError(error, "[VscodeWebview] Failed to get file diff")
      )
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
    await this.webviewManager.postMessage({
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

    void this.webviewManager.postMessage({
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
