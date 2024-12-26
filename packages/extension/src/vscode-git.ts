/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
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
    const workspaceRoot = workspaceFolders ? workspaceFolders[0]!.uri.fsPath : ""

    super(workspaceRoot, logger)

    this._onGitStatusChanged = new vscode.EventEmitter<boolean>()
    this.onGitStatusChanged = this._onGitStatusChanged.event

    this.setupFileSystemWatcher(workspaceRoot)
  }

  private setupFileSystemWatcher(workspaceRoot: string) {
    this.fsWatcher?.dispose()
    this.fsWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, "**/.git/**"),
    )

    const handleGitChange = () => {
      this._onGitStatusChanged.fire(true)
    }

    this.fsWatcher.onDidChange(handleGitChange)
    this.fsWatcher.onDidCreate(handleGitChange)
    this.fsWatcher.onDidDelete(handleGitChange)
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
      this.logger.error("Failed to get recent commits:", formatError(error))
      return []
    }
  }
}
