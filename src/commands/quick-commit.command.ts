import { VscodeCommand } from "@/commands/types";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "@/managers/solution.manager";
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

  /**
   * 无需 handle error，因为最外层 @command.manager.ts 会处理
   */
  async execute(): Promise<void> {
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

    // Handle commit based on input mode
    if (inputMode === "quickInput") {
      await this.handleQuickInput(commitMessage);
    } else {
      await this.handleWebView(commitMessage);
    }

    // Success notification
    vscode.window.showInformationMessage("Changes committed successfully");
  }

  private async handleQuickInput(initialMessage: string): Promise<void> {
    const result = await vscode.window.showInputBox({
      prompt: "Review and edit commit message",
      value: initialMessage.split("\n")[0],
      ignoreFocusOut: true,
      placeHolder: "Enter commit message",
    });

    if (!result?.trim()) throw new Error("Commit cancelled");

    await vscode.window.withProgress(
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
  }

  private async handleWebView(initialMessage: string): Promise<void> {
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
    const recentCommits = await this.getRecentCommits();

    // Get and validate HTML content
    const htmlContent = await this.getWebViewHtml();
    panel.webview.html = htmlContent;

    // Initialize with generated commit message
    panel.webview.postMessage({
      type: "init",
      commitMessage: initialMessage,
      recentCommits,
    });

    // Handle WebView interaction
    return new Promise<void>((resolve, reject) => {
      const disposables: vscode.Disposable[] = [];

      // Handle messages from WebView
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
                  panel.dispose();
                  resolve();
                  break;
                case "cancel":
                  throw new Error("Commit cancelled");
              }
            } catch (error) {
              panel.dispose();
              reject(error);
            }
          },
          undefined,
          disposables
        )
      );

      // Clean up on panel close
      disposables.push(
        panel.onDidDispose(() => {
          disposables.forEach((d) => d.dispose());
          resolve();
        })
      );
    });
  }

  private async getRecentCommits(): Promise<
    Array<{ hash: string; message: string; date: string }>
  > {
    try {
      return await this.gitService.getRecentCommits(5);
    } catch (error) {
      console.error("Failed to get recent commits:", error);
      return []; // Non-critical error, return empty array
    }
  }

  private async getWebViewHtml(): Promise<string> {
    const htmlPath = vscode.Uri.file(
      path.join(
        this.context.extensionPath,
        "src",
        "webviews",
        "commit-message.html"
      )
    );

    try {
      const content = await vscode.workspace.fs.readFile(htmlPath);
      return content.toString();
    } catch (error) {
      throw new Error("Failed to load commit message editor");
    }
  }
}
