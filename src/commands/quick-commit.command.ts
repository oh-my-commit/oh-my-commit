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
      const noDiffBehavior = vscode.workspace
        .getConfiguration("yaac")
        .get<string>("noDiffBehavior", "ignore");

      if (noDiffBehavior === "ignore") {
        vscode.window.showInformationMessage("No changes to commit");
        return;
      }

      // revise mode - allow amending last commit
      console.log("Offering to amend last commit");
      const lastCommitMessage = await this.gitService.getLastCommitMessage();

      const input = await vscode.window.showInputBox({
        title: "Amend Last Commit",
        prompt: "Edit commit message",
        value: lastCommitMessage,
        ignoreFocusOut: true,
        validateInput: (value) =>
          value ? null : "Commit message cannot be empty",
      });

      if (input?.trim()) {
        console.log("Amending last commit...");
        await this.gitService.amendCommit(input);
        vscode.window.showInformationMessage(
          "Last commit amended successfully"
        );
      }
      return;
    }

    try {
      const commitMessage = await generateCommitMessage(
        this.gitService,
        this.solutionManager
      );
      console.log(`Generated commit message: ${commitMessage}`);

      const input = await vscode.window.showInputBox({
        title: "Review Commit Message",
        prompt: "Edit commit message",
        value: commitMessage,
        ignoreFocusOut: true,
        validateInput: (value) =>
          value ? null : "Commit message cannot be empty",
      });

      if (input?.trim()) {
        console.log("Committing changes...");
        await this.gitService.stageAll();
        await this.gitService.commit(input);
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
