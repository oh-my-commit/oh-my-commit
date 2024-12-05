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
  private outputChannel: vscode.OutputChannel;

  constructor(
    gitService: VscodeGitService,
    solutionManager: SolutionManager,
    context: vscode.ExtensionContext
  ) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel("YAAC");
  }

  get config() {
    return vscode.workspace.getConfiguration("yaac");
  }

  get inputMode() {
    return this.config.get<string>("inputAppearence", "webview");
  }

  get noDiffBehavior() {
    return this.config.get<string>("noDiffBehavior", "ignore");
  }

  /**
   * 无需 handle error，因为最外层 @command.manager.ts 会处理
   */
  async execute(): Promise<void> {
    let commitMessage = "";

    const diff = await this.gitService.getDiff();

    // 仅在未改变且在修改模式下才执行 amend
    const isAmendMode = !diff && this.noDiffBehavior === "revise";

    if (!diff) {
      if (this.noDiffBehavior === "ignore") {
        throw new Error("No changes to commit");
      }

      // Amend mode - allow editing last commit
      commitMessage = await this.gitService.getLastCommitMessage();
      if (!commitMessage) {
        throw new Error("No previous commit found to amend");
      }
    } else {
      // Get solution for commit message
      const solution = await this.solutionManager.generateCommit(diff);
      if (solution.error) throw new Error(solution.error);

      const commitMessage = solution.message;
      console.log(`Generated commit message: ${commitMessage}`);
    }

    // Handle commit based on input mode
    if (this.inputMode === "quickInput") {
      await this.handleQuickInput(commitMessage, isAmendMode);
    } else {
      await this.handleWebView(commitMessage, isAmendMode);
    }

    // Success notification
    vscode.window.showInformationMessage(
      isAmendMode
        ? "Last commit amended successfully"
        : "Changes committed successfully"
    );
  }

  private async handleQuickInput(
    initialMessage: string,
    isAmendMode: boolean
  ): Promise<void> {
    const result = await vscode.window.showInputBox({
      prompt: isAmendMode
        ? "Edit previous commit message"
        : "Review and edit commit message",
      value: initialMessage.split("\n")[0],
      ignoreFocusOut: true,
      placeHolder: "Enter commit message",
    });

    if (!result?.trim()) throw new Error("Commit cancelled");

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: isAmendMode
          ? "Amending last commit..."
          : "Committing changes...",
        cancellable: false,
      },
      async () => {
        if (isAmendMode) {
          await this.gitService.amendCommit(result);
        } else {
          await this.gitService.stageAll();
          await this.gitService.commit(result);
        }
      }
    );
  }

  private async handleWebView(
    initialMessage: string,
    isAmendMode: boolean
  ): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      "commitMessage",
      isAmendMode ? "Amend Last Commit" : "Commit Message",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        enableFindWidget: true,
        // 在开发模式下启用开发者工具
        ...(process.env.NODE_ENV === "development"
          ? {
              devTools: true,
            }
          : {}),
      }
    );

    const htmlPath = vscode.Uri.file(
      path.join(
        this.context.extensionPath,
        "src",
        "webviews",
        "commit-message.html"
      )
    );
    const html = await vscode.workspace.fs.readFile(htmlPath);

    // Get recent commits
    const n = 5;
    const recentCommits = await this.gitService.getRecentCommits(n);

    panel.webview.html = Buffer.from(html).toString("utf-8");

    // Enable console.log in WebView
    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === "log") {
          this.outputChannel.appendLine(`[WebView] ${message.text}`);
        }
      },
      undefined,
      this.context.subscriptions
    );

    panel.webview.postMessage({
      type: "init",
      commitMessage: initialMessage,
      recentCommits,
      isAmendMode,
    });

    return new Promise<void>((resolve, reject) => {
      panel.webview.onDidReceiveMessage(
        async (message) => {
          console.log({ message });
          this.outputChannel.appendLine(
            `[QuickCommit] Received message: ${JSON.stringify(
              message,
              null,
              2
            )}`
          );

          try {
            switch (message.type) {
              case "commit":
                const { title, description } = message.message;
                const finalMessage = description
                  ? `${title}\n\n${description}`
                  : title;
                if (isAmendMode) {
                  await this.gitService.amendCommit(finalMessage);
                } else {
                  await this.gitService.stageAll();
                  await this.gitService.commit(finalMessage);
                }
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
        []
      );

      // Clean up on panel close
      panel.onDidDispose(() => {
        resolve();
      });
    });
  }
}
