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

  constructor(
    gitService: VscodeGitService,
    solutionManager: SolutionManager,
    context: vscode.ExtensionContext
  ) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
    this.context = context;
  }

  async execute(): Promise<void> {
    try {
      // Check if there are any changes to commit
      const hasChanges = await this.gitService.hasChanges();
      if (!hasChanges) throw new Error("No changes to commit");

      // Get the changes for generating commit message
      const changes = await this.gitService.getUnstagedChanges();
      if (!changes) throw new Error("Failed to get unstaged changes");

      // Get solution for commit message
      const solution = await this.solutionManager.generateCommit(changes);

      if (solution.error) throw new Error(solution.error);

      const commitMessage = solution.message;
      console.log(`Generated commit message: ${commitMessage}`);

      // Get user preference for commit message input
      const config = vscode.workspace.getConfiguration("yaac");
      const inputMode = config.get<string>("inputAppearence", "webview");

      if (inputMode === "quickInput") {
        // Use quick input for simple commit messages
        const result = await vscode.window.showInputBox({
          prompt: "Review and edit commit message",
          value: commitMessage.split("\n")[0], // Use first line as initial value
          ignoreFocusOut: true,
          placeHolder: "Enter commit message",
        });

        if (result === undefined || result.trim() === "")
          throw new Error("Commit cancelled");

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Committing changes...",
            cancellable: false,
          },
          async () => {
            await this.gitService.stageAll();
            await this.gitService.commit(result);
          }
        );
        vscode.window.showInformationMessage("Changes committed successfully");
        return;
      }

      // Create and show WebView in split window
      const panel = vscode.window.createWebviewPanel(
        "commitMessage",
        "Commit Message",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(this.context.extensionPath, "src", "webviews")
            ),
          ],
        }
      );

      // Get recent commits
      let recentCommits: Array<{
        hash: string;
        message: string;
        date: string;
      }> = [];
      try {
        recentCommits = await this.gitService.getRecentCommits(5);
      } catch (error) {
        console.error("Failed to get recent commits:", error);
        // Don't block the commit process if getting recent commits fails
      }

      // Get path to webview html
      const htmlPath = vscode.Uri.file(
        path.join(
          this.context.extensionPath,
          "src",
          "webviews",
          "commit-message.html"
        )
      );

      let htmlContent: Uint8Array;
      try {
        htmlContent = await vscode.workspace.fs.readFile(htmlPath);
      } catch (error) {
        console.error("Failed to read webview HTML:", error);
        vscode.window.showErrorMessage("Failed to load commit message editor");
        return;
      }

      // Set WebView content
      panel.webview.html = htmlContent.toString();

      // Initialize with generated commit message
      panel.webview.postMessage({
        type: "init",
        commitMessage,
        recentCommits,
      });

      // Handle messages from WebView
      return new Promise<void>((resolve, reject) => {
        const disposables: vscode.Disposable[] = [];

        disposables.push(
          panel.webview.onDidReceiveMessage(
            async (message) => {
              try {
                switch (message.type) {
                  case "commit":
                    await vscode.window.withProgress(
                      {
                        location: vscode.ProgressLocation.Notification,
                        title: "Committing changes...",
                        cancellable: false,
                      },
                      async () => {
                        await this.gitService.stageAll();
                        await this.gitService.commit(message.message);
                      }
                    );
                    vscode.window.showInformationMessage(
                      "Changes committed successfully"
                    );
                    panel.dispose();
                    resolve();
                    break;
                  case "cancel":
                    vscode.window.showInformationMessage("Commit cancelled");
                    panel.dispose();
                    resolve();
                    break;
                }
              } catch (error: unknown) {
                console.error("Error during commit:", error);
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
                vscode.window.showErrorMessage(
                  `Failed to commit: ${errorMessage}`
                );
                panel.dispose();
                reject(error);
              }
            },
            undefined,
            disposables
          )
        );

        // Handle panel close
        disposables.push(
          panel.onDidDispose(() => {
            disposables.forEach((d) => d.dispose());
            resolve();
          })
        );
      });
    } catch (error: unknown) {
      console.error("Error in quick commit command:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      vscode.window.showErrorMessage(`Error: ${errorMessage}`);
      throw error;
    }
  }
}
