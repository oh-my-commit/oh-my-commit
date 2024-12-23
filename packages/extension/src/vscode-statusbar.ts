import {
  APP_ID_CAMEL,
  APP_NAME,
  BaseLogger,
  COMMAND_SELECT_MODEL,
  CommitManager,
  TOKENS,
} from "@shared/common"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"
import { VscodeGit } from "./vscode-git"
import { VSCODE_TOKENS } from "./vscode-token"

@Service()
export class StatusBarManager implements vscode.Disposable {
  private disposables: vscode.Disposable[] = []
  private statusBarItem: vscode.StatusBarItem

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: BaseLogger,
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(VSCODE_TOKENS.Git) private readonly gitService: VscodeGit,
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
    this.statusBarItem.name = APP_NAME

    // 设置初始状态
    this.statusBarItem.text = `$(sync~spin) ${APP_NAME} (Initializing...)`
    this.statusBarItem.show()

    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(APP_ID_CAMEL)) {
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

    void this.update()
  }

  private async update(): Promise<void> {
    try {
      if (!this.commitManager?.providersManager) {
        this.statusBarItem.text = `$(error) ${APP_NAME} (Initializing...)`
        this.statusBarItem.tooltip = "Provider manager is not initialized"
        this.statusBarItem.command = undefined
        return
      }

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
    } catch (error) {
      this.logger.error("Error updating status bar:", error)
      this.statusBarItem.text = `$(error) ${APP_NAME} (Error)`
      this.statusBarItem.tooltip = "Error updating status. Check logs for details."
      this.statusBarItem.command = undefined
    }
  }

  public dispose(): void {
    this.logger.info("Disposing status bar")
    this.statusBarItem.dispose()
    this.disposables.forEach(d => d.dispose())
  }
}
