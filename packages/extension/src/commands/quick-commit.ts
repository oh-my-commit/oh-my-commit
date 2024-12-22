import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"
import { VscodeGit } from "@/vscode-git"
import { VSCODE_TOKENS } from "@/vscode-token"
import { VscodeWebview } from "@/vscode-webview"
import { COMMAND_QUICK_COMMIT, TOKENS, type CommitManager } from "@shared/common"
import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

@Service()
export class QuickCommitCommand implements BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"

  @Inject(VSCODE_TOKENS.GitService) private gitService!: VscodeGit
  @Inject(TOKENS.CommitManager) private commitManager!: CommitManager
  @Inject(TOKENS.Logger) private logger!: VscodeLogger
  @Inject(VSCODE_TOKENS.Context) private context!: vscode.ExtensionContext

  private webviewManager: VscodeWebview

  constructor() {
    this.webviewManager = new VscodeWebview({
      onClientMessage: async message => {
        this.logger.info("QuickCommit received message:", message)
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
      },
    })

    // Clean up file watcher when extension is deactivated
    this.context.subscriptions.push(this)
  }

  public dispose(): void {
    this.webviewManager.dispose()
  }

  async execute(): Promise<void> {
    await this.webviewManager.createWebviewPanel()
  }

  private async getLatestDiff(selectedFiles?: string[]) {
    this.logger.info("Getting latest diff, selectedFiles:", selectedFiles)
    await this.gitService.stageAll()
    const diffResult = await this.gitService.getDiffResult()
    this.logger.info("Done Getting Latest diff")
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

    return newDiffSummary
  }

  private async syncFilesAndCommits(selectedFiles?: string[]) {
    const diff = await this.getLatestDiff(selectedFiles)
    if (!selectedFiles) {
      await this.webviewManager.postMessage({
        type: "diff-result",
        data: diff,
      })
    }

    this.logger.info("[QuickCommit] Generating commit via acManager...")
    const commit = await this.commitManager.generateCommit(diff)
    this.logger.info("[QuickCommit] Generated commit via acManager:", commit)

    if (commit.isOk()) {
      await this.webviewManager.postMessage({
        type: "commit-message",
        data: commit.value,
      })
    }
  }
}
