import { VscodeCommand } from "@/core/vscode-commands/types";
import { AcManager } from "@/core/ac";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import * as vscode from "vscode";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private outputChannel: vscode.OutputChannel;
  private webviewManager: WebviewManager;

  constructor(
    gitService: VscodeGitService,
    _acManager: AcManager,
    context: vscode.ExtensionContext
  ) {
    this.gitService = gitService;
    this.outputChannel = vscode.window.createOutputChannel("YAAC");
    this.webviewManager = new WebviewManager(
      context,
      "yaacCommit",
      "Commit Changes",
      this.outputChannel
    );

    // Clean up file watcher when extension is deactivated
    context.subscriptions.push(this);
  }

  public dispose(): void {
    this.webviewManager.dispose();
  }

  get config() {
    return vscode.workspace.getConfiguration("yaac");
  }

  get emptyChangeBehavior() {
    return this.config.get<string>("emptyChangeBehavior", "skip");
  }

  /**
   * 无需 handle error，因为最外层 @command.manager.ts 会处理
   */
  async execute(): Promise<void> {
    // Get all changes before staging
    const changedFiles = await this.gitService.getChangedFiles();

    // 先暂存全部 // todo: is it safe
    await this.gitService.stageAll();
    const diff = await this.gitService.getStagedDiff();

    // 仅在未改变且在 amend 模式下才执行 amend
    const isAmendMode = !diff && this.emptyChangeBehavior === "amend";
    console.log({ diff, isAmendMode });

    if (!diff && !isAmendMode) {
      throw new Error("No changes to commit");
    }

    let initialMessage = "";
    if (isAmendMode) {
      // Amend mode - get last commit message
      initialMessage = await this.gitService.getLastCommitMessage();
      if (!initialMessage) {
        throw new Error("No previous commit found to amend");
      }
    }

    // Create webview panel
    const panel = await this.webviewManager.createWebviewPanel();

    console.log("== Initialing data...");
    // Send initial data to webview
    const data = {
      type: "init",
      initialMessage,
      isAmendMode,
      diff,
      stagedFiles: changedFiles.staged,
      unstagedFiles: changedFiles.unstaged,
      totalAdditions:
        changedFiles.staged.additions + changedFiles.unstaged.additions,
      totalDeletions:
        changedFiles.staged.deletions + changedFiles.unstaged.deletions,
    };
    console.log("== Initial data:", data);
    panel.webview.postMessage(data);

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async (message: { command: string; message: string }) => {
        try {
          switch (message.command) {
            case "commit":
              if (isAmendMode) {
                await this.gitService.amendCommit(message.message);
              } else {
                await this.gitService.commit(message.message);
              }
              vscode.window.showInformationMessage(
                isAmendMode
                  ? "Last commit amended successfully"
                  : "Changes committed successfully"
              );
              panel.dispose();
              break;
            case "cancel":
              panel.dispose();
              break;
          }
        } catch (error) {
          this.outputChannel.appendLine(`Error: ${error}`);
          vscode.window.showErrorMessage(`Failed to commit: ${error}`);
        }
      }
    );
  }
}
