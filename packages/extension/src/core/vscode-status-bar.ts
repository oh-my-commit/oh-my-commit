import * as vscode from "vscode";
import { AcManager } from "@/core/ac";
import { VscodeGitService } from "@/core/vscode-git";
import { Loggable } from "@/types/mixins";
import { AppManager } from "@/core";

export class StatusBarManager
  extends Loggable(class {})
  implements vscode.Disposable
{
  private statusBarItem: vscode.StatusBarItem;
  private gitService: VscodeGitService;
  private disposables: vscode.Disposable[] = [];
  private acManager: AcManager;

  constructor(app: AppManager) {
    super();
    this.logger = app.getLogger();
    StatusBarManager.setLogger(this.logger);

    this.acManager = app.acManager;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.name = "Oh My Commit";
    this.gitService = new VscodeGitService();

    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("oh-my-commit")) {
          this.update();
        }
      })
    );

    // 监听工作区变化（可能影响 git 状态）
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.update();
      })
    );
  }

  public initialize(): void {
    this.logger.info("Initializing status bar");
    this.statusBarItem.show();
    this.update();
  }

  private async update(): Promise<void> {
    const currentModel = await this.acManager.getCurrentModel();
    const isGitRepo = await this.gitService.isGitRepository();

    if (!isGitRepo) {
      this.statusBarItem.text = "$(error) Oh My Commit: Not a Git repository";
      this.statusBarItem.tooltip = "This workspace is not a Git repository";
      this.statusBarItem.command = undefined;
      return;
    }

    if (!currentModel) {
      this.statusBarItem.text = "$(error) Oh My Commit: No model selected";
      this.statusBarItem.tooltip = "Click to select a model";
      this.statusBarItem.command = "omc.selectModel";
      return;
    }

    this.statusBarItem.text = `$(git-commit) Oh My Commit: ${currentModel.name}`;
    this.statusBarItem.tooltip = `Current model: ${currentModel.name}\nClick to change model`;
    this.statusBarItem.command = "omc.selectModel";
  }

  public dispose(): void {
    this.logger.info("Disposing status bar");
    this.statusBarItem.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
