/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { TOKENS } from "@shared/common"
import { GitCore, IGitCore } from "@shared/server"

import { VscodeLogger } from "@/managers/vscode-logger"

export interface IVscodeGit extends IGitCore {
  onGitStatusChanged: vscode.Event<boolean>

  dispose(): void
}

@Service()
export class VscodeGit extends GitCore implements IVscodeGit {
  readonly onGitStatusChanged: vscode.Event<boolean>
  private _onGitStatusChanged: vscode.EventEmitter<boolean>
  private fsWatcher: vscode.FileSystemWatcher | undefined

  constructor(@Inject(TOKENS.Logger) protected override logger: VscodeLogger) {
    const workspaceFolders = vscode.workspace.workspaceFolders
    const workspaceRoot = workspaceFolders ? workspaceFolders[0]!.uri.fsPath : ""

    super(workspaceRoot, logger)

    this._onGitStatusChanged = new vscode.EventEmitter<boolean>()
    this.onGitStatusChanged = this._onGitStatusChanged.event

    this.setupFileSystemWatcher(workspaceRoot)
  }

  dispose() {
    this.fsWatcher?.dispose()
    this._onGitStatusChanged.dispose()
  }

  private setupFileSystemWatcher(workspaceRoot: string) {
    this.fsWatcher?.dispose()

    if (!workspaceRoot) {
      this.logger.warn("[VscodeGit] No workspace root, skipping file watcher setup")
      return
    }

    // Watch all files in workspace, not just .git directory
    this.fsWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceRoot, "**/*"))

    const handleGitChange = async (uri: vscode.Uri) => {
      this.logger.info("[VscodeGit] File changed:", uri.fsPath)

      // Special case: if .git directory is deleted, we need to emit the change
      if (uri.fsPath.endsWith("/.git")) {
        this.logger.info("[VscodeGit] .git directory changed, emitting event")
        this._onGitStatusChanged.fire(false)
        return
      }

      // Ignore other changes in .git directory to avoid feedback loops
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
        // If git command fails, it might mean we're no longer in a git repo
        this.logger.error("[VscodeGit] Error checking git status:", error)
        this._onGitStatusChanged.fire(false)
      }
    }

    this.fsWatcher.onDidChange(handleGitChange)
    this.fsWatcher.onDidCreate(handleGitChange)
    this.fsWatcher.onDidDelete(handleGitChange)

    this.logger.info("[VscodeGit] File system watcher setup for:", workspaceRoot)
  }
}
