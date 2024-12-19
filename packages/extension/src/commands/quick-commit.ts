import { BaseCommand } from "@/libs/vscode-command"
import { VscodeWebview } from "@/libs/vscode-webview"
import type { AcManager } from "@/services/model.service"
import type { VscodeGitService } from "@/services/vscode-git.service"
import { COMMAND_QUICK_COMMIT } from "@shared"
import type { DiffResult } from "simple-git"
import type * as vscode from "vscode"

export class QuickCommitCommand extends BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"

  private webviewManager: VscodeWebview
  private gitService: VscodeGitService
  private acManager: AcManager

  constructor(
    gitService: VscodeGitService,
    acManager: AcManager,
    context: vscode.ExtensionContext,
  ) {
    super()
    this.gitService = gitService
    this.acManager = acManager

    this.webviewManager = new VscodeWebview(context, {
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
    context.subscriptions.push(this)
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
    const diffResult = await this.getLatestDiff(selectedFiles)
    if (!selectedFiles) {
      await this.webviewManager.postMessage({
        type: "diff-result",
        data: diffResult,
      })
    }

    this.logger.info("[QuickCommit] Generating commit via acManager...")
    const commit = await this.acManager.generateCommit(diffResult)
    this.logger.info("[QuickCommit] Generated commit via acManager:", commit)

    if (commit.isOk()) {
      await this.webviewManager.postMessage({
        type: "commit-message",
        data: commit.value,
      })
    }
  }
}
