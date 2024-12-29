/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
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
  IInputOptions,
  IResult,
  ResultDTO,
  formatError,
} from "@shared/common"

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
    this.webviewManager.setMessageHandler(
      async (message: ClientMessageEvent) => {
        switch (message.type) {
          case "init":
            await this.syncFiles()
            break

          case "show-info":
            void vscode.window.showInformationMessage(message.data.message)
            break

          case "open-external":
            void vscode.env.openExternal(vscode.Uri.parse(message.data.url))
            break

          case "generate":
            await this.execute()
            break

          case "get-settings":
            try {
              const config = vscode.workspace.getConfiguration("ohMyCommit")
              const value = config.get(message.data.section)
              await this.webviewManager?.postMessage({
                type: "settings-value",
                data: {
                  section: message.data.section,
                  value,
                },
              })
            } catch (error) {
              this.logger.error(
                "[VscodeWebview] Failed to get settings:",
                error
              )
            }
            break

          case "update-settings":
            try {
              const config = vscode.workspace.getConfiguration("ohMyCommit")
              // 对于 git.commitLanguage，需要更新完整的配置路径
              const section = message.data.section.startsWith("ohMyCommit.")
                ? message.data.section
                : `ohMyCommit.${message.data.section}`

              await vscode.workspace
                .getConfiguration()
                .update(
                  section,
                  message.data.value,
                  vscode.ConfigurationTarget.Global
                )

              // 通知 webview 更新成功
              await this.webviewManager?.postMessage({
                type: "settings-updated",
                data: {
                  section: message.data.section,
                  value: message.data.value,
                },
              })
            } catch (error) {
              this.logger.error(
                "[VscodeWebview] Failed to update settings:",
                error
              )
            }
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
              void vscode.window.showInformationMessage(
                "Changes committed successfully"
              )

              // Refresh git status
              await this.syncFiles()
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
              void vscode.window.showErrorMessage(
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

          case "execute-command":
            if (message.command) {
              try {
                await vscode.commands.executeCommand(message.command)
                this.logger.info(
                  "[VscodeWebview] Executed command:",
                  message.command
                )

                // Auto refresh after git init
                if (message.command === "git.init") {
                  // Wait a bit for git to initialize
                  setTimeout(() => {
                    void this.syncFiles()
                  }, 500)
                }
              } catch (error) {
                this.logger.error(
                  "[VscodeWebview] Failed to execute command:",
                  error
                )
              }
            }
            break
        }
      }
    )

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
    return commit
  }

  async execute(): Promise<void> {
    this.statusBar.setWaiting("Generating commit message...")

    const commit = await this.genCommit()

    this.statusBar.clearWaiting()

    if (!commit.ok) {
      void vscode.window.showErrorMessage(
        `Failed to generate commit! Reason: ${commit.message}`
      )
      return
    }

    const uiMode = this.config.get<string>("ohMyCommit.ui.mode") || "panel"
    this.logger.info("[QuickCommit] UI mode:", uiMode)

    // Concurrently create webview panel and show notification
    await Promise.all([
      // Create and update webview panel
      (async () => {
        this.logger.info(
          "[QuickCommit] posting commit message to webview panel..."
        )
        // await this.webviewManager?.createWebviewPanel()
        await this.webviewManager?.postMessage({
          type: "commit-message",
          data: commit,
        })
      })(),
      // Show notification and handle user interaction
      (async () => {
        if (uiMode !== "notification") return

        this.logger.info("[QuickCommit] showing commit message notification...")
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

  private async syncFiles() {
    // First check git status
    const isGitRepository = await this.gitService.isGitRepository()
    const workspaceRoot = this.gitService.workspaceRoot

    // Send git status
    await this.webviewManager?.postMessage({
      type: "git-status",
      data: {
        isGitRepository,
        workspaceRoot: workspaceRoot || null,
      },
    })

    // If not a git repository, don't proceed with diff
    if (!isGitRepository) {
      return
    }

    await this.webviewManager?.postMessage({
      type: "diff-result",
      data: await this.getLatestDiff(),
    })
  }
}
