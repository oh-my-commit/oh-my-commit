import * as vscode from "vscode";
import { SolutionManager } from "@/managers/solution.manager";
import { GitManager } from "@/managers/git.manager";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private gitManager: GitManager;
  private disposables: vscode.Disposable[] = [];

  constructor(private solutionManager: SolutionManager) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.name = "YAAC";
    this.gitManager = new GitManager();

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
      const isGitRepo = await this.gitManager.isGitRepository();

      if (!isGitRepo) {
        this.statusBarItem.text = "$(git-commit) YAAC (No Git)";
        this.statusBarItem.tooltip =
          "YAAC requires a Git repository to function.\nInitialize a Git repository to enable all features.";
        this.statusBarItem.command = undefined;
        return;
      }

      const solution = await this.solutionManager.getCurrentSolution();
      if (!solution) {
        this.statusBarItem.text = "$(git-commit) YAAC";
        this.statusBarItem.tooltip = "Click to select a commit solution";
      } else {
        this.statusBarItem.command = "yaac.manageSolutions";

        const isValid = await this.solutionManager.getSolutionValidationStatus(
          solution
        );

        // 更新状态栏图标和工具提示
        this.statusBarItem.text = `$(git-commit) YAAC (${solution.name}) ${
          isValid ? "$(pass)" : "$(warning)"
        }`;

        this.statusBarItem.tooltip =
          `Current solution: ${solution.name}\n` +
          `Status: ${isValid ? "Validated" : "Not Validated"}\n` +
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
