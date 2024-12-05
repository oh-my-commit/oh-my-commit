import * as vscode from "vscode";
import { SolutionManager } from "../core/solutionManager";
import { GitManager } from "../core/gitManager";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private gitManager: GitManager;

  constructor(private solutionManager: SolutionManager) {
    console.log("Initializing StatusBarManager");
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.name = "YAAC";
    this.gitManager = new GitManager();
  }

  public async initialize() {
    console.log("Setting up status bar item");

    try {
      // 检查是否在 Git 仓库中
      const isGitRepo = await this.gitManager.isGitRepository();

      if (!isGitRepo) {
        console.log("Not in a Git repository");
        this.statusBarItem.text = "$(git-commit) YAAC (No Git)";
        this.statusBarItem.tooltip =
          "YAAC requires a Git repository to function. \nInitialize a Git repository to enable all features.";
        this.statusBarItem.command = undefined;
        this.statusBarItem.show();
        return;
      }

      this.statusBarItem.command = "yaac.switchSolution";
      await this.update();
      this.statusBarItem.show();
      console.log("Status bar item is now visible");
    } catch (error) {
      console.error("Error initializing status bar:", error);
      this.statusBarItem.text = "$(warning) YAAC";
      this.statusBarItem.tooltip =
        "Error initializing YAAC. Click for details.";
      this.statusBarItem.command = {
        title: "Show Error",
        command: "vscode.showErrorMessage",
        arguments: [
          "Failed to initialize YAAC. Please check if you have Git installed and try again.",
        ],
      };
      this.statusBarItem.show();
    }
  }

  public async update() {
    try {
      console.log("Updating status bar");
      const currentSolution = await this.solutionManager.getCurrentSolution();
      if (currentSolution) {
        console.log(`Current solution: ${currentSolution.name}`);
        this.statusBarItem.text = `$(git-commit) YAAC: ${currentSolution.name}`;
        this.statusBarItem.tooltip =
          `Current Commit Solution: ${currentSolution.name}\n` +
          `Cost: ${currentSolution.metrics.cost}\n` +
          `Performance: ${currentSolution.metrics.performance}\n` +
          `Quality: ${currentSolution.metrics.quality}\n` +
          `Click to change`;
      } else {
        console.log("No current solution selected");
        this.statusBarItem.text = "$(git-commit) YAAC";
        this.statusBarItem.tooltip = "Click to select a commit solution";
      }
      // 确保状态栏项目可见
      this.statusBarItem.show();
    } catch (error) {
      console.error("Error updating status bar:", error);
      this.statusBarItem.text = "$(warning) YAAC";
      this.statusBarItem.tooltip = "Error updating status bar. Click to retry.";
      this.statusBarItem.show();
    }
  }

  public dispose() {
    console.log("Disposing status bar item");
    this.statusBarItem.dispose();
  }
}
