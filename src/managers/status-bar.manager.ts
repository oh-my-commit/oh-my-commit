import * as vscode from "vscode";
import { SolutionManager } from "@/managers/solution.manager";
import { VscodeGitService } from "@/services/vscode-git.service";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private gitService: VscodeGitService;
  private disposables: vscode.Disposable[] = [];

  constructor(private solutionManager: SolutionManager) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.name = "YAAC";
    this.gitService = new VscodeGitService();

    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("yaac")) {
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

    // 监听 Git 状态变化
    this.disposables.push(
      this.gitService.onGitStatusChanged(() => {
        this.update();
      })
    );
  }

  public async initialize() {
    await this.update();
  }

  public show() {
    this.statusBarItem.show();
  }

  public hide() {
    this.statusBarItem.hide();
  }

  public async update() {
    try {
      const isGitRepo = await this.gitService.isGitRepository();

      if (!isGitRepo) {
        this.statusBarItem.text = "$(git-commit) YAAC (No Git)";
        this.statusBarItem.tooltip =
          "YAAC requires a Git repository to function.\nInitialize a Git repository to enable all features.";
        this.statusBarItem.command = undefined;
        return;
      }

      const solution = await this.solutionManager.getCurrentSolution();
      this.statusBarItem.text = "$(git-commit) YAAC";
      if (!solution) {
        this.statusBarItem.text = "$(git-commit) YAAC (No Solution)";
        this.statusBarItem.tooltip = "Click to select a commit solution";
      } else {
        this.statusBarItem.command = "yaac.selectSolution";
        this.statusBarItem.text = `$(git-commit) YAAC (${solution.name})`;
        this.statusBarItem.tooltip =
          `Current solution: ${solution.name}\n` +
          `Accuracy: ${solution.metrics.accuracy}, Speed: ${solution.metrics.speed}, Cost: ${solution.metrics.cost}\n` +
          `Click to change solution`;
      }
    } catch (error) {
      this.statusBarItem.text = "$(warning) YAAC";
      this.statusBarItem.tooltip = "Error updating YAAC. Click for details.";
      this.statusBarItem.command = {
        title: "Show Error",
        command: "vscode.showErrorMessage",
        arguments: [`Failed to update YAAC status: ${error}`],
      };
    }
  }

  public dispose() {
    this.statusBarItem.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
