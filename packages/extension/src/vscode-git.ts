/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { TOKENS, formatError } from "@shared/common"
import { GitCore } from "@shared/server"

import { VscodeLogger } from "./vscode-commit-adapter"

@Service()
export class VscodeGit extends GitCore {
  private _onGitStatusChanged: vscode.EventEmitter<boolean>
  readonly onGitStatusChanged: vscode.Event<boolean>
  private fsWatcher: vscode.FileSystemWatcher | undefined

  constructor(@Inject(TOKENS.Logger) protected override logger: VscodeLogger) {
    const workspaceFolders = vscode.workspace.workspaceFolders
    const workspaceRoot = workspaceFolders
      ? workspaceFolders[0]!.uri.fsPath
      : ""

    if (!workspaceRoot) {
      throw new Error(
        "No workspace folder is opened. Please open a workspace first."
      )
    }

    // Validate workspace exists
    if (!vscode.workspace.fs.stat(vscode.Uri.file(workspaceRoot))) {
      throw new Error(
        "The workspace directory does not exist. Please open a valid workspace."
      )
    }

    super(workspaceRoot, logger)

    this._onGitStatusChanged = new vscode.EventEmitter<boolean>()
    this.onGitStatusChanged = this._onGitStatusChanged.event

    this.setupFileSystemWatcher(workspaceRoot)
  }

  private setupFileSystemWatcher(workspaceRoot: string) {
    this.fsWatcher?.dispose()

    if (!workspaceRoot) {
      this.logger.warn(
        "[VscodeGit] No workspace root, skipping file watcher setup"
      )
      return
    }

    // Watch all files in workspace, not just .git directory
    this.fsWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, "**/*")
    )

    const handleGitChange = async (uri: vscode.Uri) => {
      this.logger.info("[VscodeGit] File changed:", uri.fsPath)

      // Ignore changes in .git directory to avoid feedback loops
      if (uri.fsPath.includes("/.git/")) {
        return
      }

      try {
        // Only emit if the changed file is git tracked
        const status = await this.git.status()
        const hasChanges = status.files.length > 0

        if (hasChanges) {
          this.logger.info("[VscodeGit] Git status changed, emitting event")
          this._onGitStatusChanged.fire(true)
        }
      } catch (error) {
        this.logger.error("[VscodeGit] Error checking git status:", error)
      }
    }

    this.fsWatcher.onDidChange(handleGitChange)
    this.fsWatcher.onDidCreate(handleGitChange)
    this.fsWatcher.onDidDelete(handleGitChange)

    this.logger.info(
      "[VscodeGit] File system watcher setup for:",
      workspaceRoot
    )
  }

  dispose() {
    this.fsWatcher?.dispose()
    this._onGitStatusChanged.dispose()
  }

  public async getRecentCommits(count: number = 5) {
    try {
      const logs = await this.git.log({ maxCount: count })
      this.logger.info("recent commits: ", logs)

      return logs.all
    } catch (error) {
      this.logger.error(formatError(error, "Failed to get recent commits"))
      return []
    }
  }
}
