import { VscodeCommand } from "@/commands/types";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "@/managers/solution.manager";
import { generateCommitMessage } from "@/utils/generate-commit-message";
import * as vscode from "vscode";
import * as path from "path";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private solutionManager: SolutionManager;
  private context: vscode.ExtensionContext;

  constructor(gitService: VscodeGitService, solutionManager: SolutionManager, context: vscode.ExtensionContext) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
    this.context = context;
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

      // Create and show WebView
      const panel = vscode.window.createWebviewPanel(
        'commitMessage',
        'Commit Message',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // Get path to webview html
      const htmlPath = vscode.Uri.file(
        path.join(this.context.extensionPath, 'src', 'webviews', 'commit-message.html')
      );
      const htmlContent = await vscode.workspace.fs.readFile(htmlPath);
      
      // Set WebView content
      panel.webview.html = htmlContent.toString();

      // Initialize with generated commit message
      panel.webview.postMessage({
        type: 'init',
        commitMessage
      });

      // Handle messages from WebView
      return new Promise<void>((resolve, reject) => {
        panel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.type) {
              case 'commit':
                try {
                  console.log("Committing changes...");
                  await this.gitService.stageAll();
                  await this.gitService.commit(message.message);
                  vscode.window.showInformationMessage("Changes committed successfully");
                  panel.dispose();
                  resolve();
                } catch (error: unknown) {
                  console.error("Error during quick commit:", error);
                  const errorMessage =
                    error instanceof Error ? error.message : "Unknown error occurred";
                  vscode.window.showErrorMessage(`Failed to commit: ${errorMessage}`);
                  reject(error);
                }
                break;
              case 'cancel':
                panel.dispose();
                resolve();
                break;
            }
          },
          undefined,
          this.context.subscriptions
        );

        // Handle panel close
        panel.onDidDispose(() => {
          resolve();
        });
      });
    } catch (error: unknown) {
      console.error("Error during quick commit:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      vscode.window.showErrorMessage(`Failed to commit: ${message}`);
    }
  }
}
