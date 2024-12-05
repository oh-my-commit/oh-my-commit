import * as vscode from "vscode";
import { SolutionManager } from "@/managers/solution.manager";
import { GitManager } from "@/managers/git.manager";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private gitManager: GitManager;

  constructor(private solutionManager: SolutionManager) {
    console.log("Initializing StatusBarManager");
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.name = "YAAC";
    this.gitManager = new GitManager();
  }

  public async initialize() {
    console.log("Setting up status bar item");
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
      // 检查是否在 Git 仓库中
      const isGitRepo = await this.gitManager.isGitRepository();

      if (!isGitRepo) {
        console.log("Not in a Git repository");
        this.statusBarItem.text = "$(git-commit) YAAC (No Git)";
        this.statusBarItem.tooltip =
          "YAAC requires a Git repository to function. \nInitialize a Git repository to enable all features.";
        this.statusBarItem.command = undefined;
        return;
      }

      // 获取当前方案
      const solution = await this.solutionManager.getCurrentSolution();
      if (!solution) {
        this.statusBarItem.text = "$(git-commit) YAAC";
        this.statusBarItem.tooltip = "Click to select a commit solution";
      } else {
        this.statusBarItem.text = `$(git-commit) YAAC (${solution.name})`;
        this.statusBarItem.tooltip = `Current solution: ${solution.name}\nAccuracy: ${solution.metrics.accuracy}, Speed: ${solution.metrics.speed}, Cost: ${solution.metrics.cost}\nClick to change solution`;
      }

      this.statusBarItem.command = "yaac.manageSolutions";
      console.log("Status bar updated successfully");
    } catch (error) {
      console.error("Error updating status bar:", error);
      this.statusBarItem.text = "$(warning) YAAC";
      this.statusBarItem.tooltip = "Error updating YAAC. Click for details.";
      this.statusBarItem.command = {
        title: "Show Error",
        command: "vscode.showErrorMessage",
        arguments: [`Failed to update YAAC status: ${error}`],
      };
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
