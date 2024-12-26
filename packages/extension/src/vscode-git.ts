import { TOKENS, formatError } from "@shared/common"
import { GitCore } from "@shared/server"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

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
