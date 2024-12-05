import { VscodeCommand } from "@/commands/types";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "@/managers/solution.manager";
import { generateCommitMessage } from "@/utils/generate-commit-message";
import * as vscode from "vscode";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private solutionManager: SolutionManager;

  constructor(gitService: VscodeGitService, solutionManager: SolutionManager) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
  }

  async execute(): Promise<void> {
    console.log("Quick commit command triggered");

    if (!(await this.gitService.isGitRepository())) {
      console.log("Not a git repository");
      return;
    }

    const solution = await this.solutionManager.getCurrentSolution();
    if (!solution) {
      console.log("No solution selected");
      return;
    }

    if (!(await this.gitService.hasChanges())) {
      console.log("No changes detected");
      vscode.window.showInformationMessage("No changes to commit");
      return;
    }

    try {
      const commitMessage = await generateCommitMessage(
        this.gitService,
        this.solutionManager
      );
      console.log(`Generated commit message: ${commitMessage}`);

      const confirmed = await vscode.window.showInputBox({
        prompt: "Review and edit commit message if needed",
        value: commitMessage,
        validateInput: (value) =>
          value ? null : "Commit message cannot be empty",
      });

      if (confirmed) {
        console.log("Committing changes...");
        await this.gitService.stageAll();
        await this.gitService.commit(confirmed);
        vscode.window.showInformationMessage("Changes committed successfully");
      }
    } catch (error: unknown) {
      console.error("Error during quick commit:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      vscode.window.showErrorMessage(`Failed to commit: ${message}`);
    }
  }
}
