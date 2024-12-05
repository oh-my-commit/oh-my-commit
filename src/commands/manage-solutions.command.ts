import * as vscode from "vscode";
import { BaseCommand } from "./base.command";
import { GitManager } from "@/managers/git.manager";
import { SolutionManager } from "@/managers/solution.manager";

export class ManageSolutionsCommand extends BaseCommand {
  constructor(gitManager: GitManager, solutionManager: SolutionManager) {
    super("yaac.manageSolutions", gitManager, solutionManager);
  }

  async execute(): Promise<void> {
    console.log("Manage solutions command triggered");

    const solutions = await this.solutionManager.getAvailableSolutions();
    if (solutions.length === 0) {
      console.log("No available solutions found");
      vscode.window.showErrorMessage("No available solutions");
      return;
    }

    try {
      const currentSolution = await this.solutionManager.getCurrentSolution();
      const selected = await vscode.window.showQuickPick(
        solutions.map((s) => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: `Accuracy: ${s.metrics.accuracy}, Speed: ${s.metrics.speed}, Cost: ${s.metrics.cost}`,
          picked: currentSolution?.id === s.id,
        })),
        {
          placeHolder: "Select AI Model to Use",
          matchOnDescription: true,
          matchOnDetail: true,
        }
      );

      if (selected) {
        console.log(`Switched to solution: ${selected.id}`);
        await this.solutionManager.selectSolution(selected.id);
      }
    } catch (error: unknown) {
      console.error("Error in manage solutions command:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      vscode.window.showErrorMessage(`Failed to manage solutions: ${message}`);
    }
  }
}
