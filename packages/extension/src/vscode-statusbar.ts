import { Loggable } from "@/features/mixins"
import { VscodeGit } from "@/vscode-git"
import { APP_ID, APP_NAME, COMMAND_SELECT_MODEL, CommitManager } from "@shared/common"
import * as vscode from "vscode"

export class StatusBarManager extends Loggable(class {}) implements vscode.Disposable {
  private gitService: VscodeGit
  private commitManager: CommitManager

  private disposables: vscode.Disposable[] = []
  private statusBarItem: vscode.StatusBarItem

  constructor(commitManager: CommitManager, gitService: VscodeGit) {
    super()

    this.commitManager = commitManager
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
    this.statusBarItem.name = APP_NAME
    this.gitService = gitService

    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(APP_ID)) {
          this.update()
        }
      }),
    )

    // 监听工作区变化（可能影响 git 状态）
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.update()
      }),
    )

    this.logger.info("Initializing status bar")
    this.statusBarItem.show()
    this.update()
  }

  private async update(): Promise<void> {
    const modelId = this.commitManager.modelId
    const model = this.commitManager.model
    this.logger.info(`Updating status: `, { modelId, model })
    const isGitRepo = await this.gitService.isGitRepository()

    if (!isGitRepo) {
      this.statusBarItem.text = `$(error) ${APP_NAME} (Not a Git repository)`
      this.statusBarItem.tooltip = "This workspace is not a Git repository"
      this.statusBarItem.command = undefined
      return
    }

    if (!model) {
      this.statusBarItem.text = `$(error) ${APP_NAME} (No model selected)`
      this.statusBarItem.tooltip = "Click to select a model"
      this.statusBarItem.command = COMMAND_SELECT_MODEL
      return
    }

    this.statusBarItem.text = `$(git-commit) ${APP_NAME} (${model.name})`
    this.statusBarItem.tooltip = `Current model: ${model.name}\nClick to change model`
    this.statusBarItem.command = COMMAND_SELECT_MODEL
  }

  public dispose(): void {
    this.logger.info("Disposing status bar")
    this.statusBarItem.dispose()
    this.disposables.forEach(d => d.dispose())
  }
}
