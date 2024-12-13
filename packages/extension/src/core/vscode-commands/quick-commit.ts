import { VscodeCommand } from "@/core/vscode-commands/types";
import { AcManager } from "@/core/ac";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import * as vscode from "vscode";
import { FileChange, FileStatus } from "@yaac/shared";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private logger: vscode.LogOutputChannel;
  private webviewManager: WebviewManager;

  constructor(
    gitService: VscodeGitService,
    _acManager: AcManager,
    context: vscode.ExtensionContext,
    logger: vscode.LogOutputChannel
  ) {
    this.gitService = gitService;
    this.logger = logger;
    // Clear log file on extension startup
    this.logger.clear();

    this.webviewManager = new WebviewManager(
      context,
      "yaacCommit",
      "YAAC Commit",
      this.logger
    );

    // Register message handlers
    this.webviewManager.registerMessageHandler("commit", async (message) => {
      try {
        const { message: commitMessage } = message;
        await this.gitService.commit(commitMessage);
        vscode.window.showInformationMessage("Changes committed successfully!");
        this.webviewManager.dispose();
      } catch (error) {
        this.logger.error(error as Error);
        vscode.window.showErrorMessage(`Failed to commit: ${error}`);
      }
    });

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

    // Transform file paths to FileChange objects
    const transformFiles = (
      files: string[],
      isStaged: boolean
    ): FileChange[] => {
      return files.map((path) => ({
        path,
        type: "modified" as FileStatus, // Default to modified, we can enhance this later
        status: "modified" as FileStatus,
        additions: 0, // We'll need to enhance this to get actual numbers
        deletions: 0,
        displayName: path.split("/").pop() || path,
        isStaged,
      }));
    };

    const stagedFileChanges = transformFiles(changedFiles.staged.files, true);
    const unstagedFileChanges = transformFiles(
      changedFiles.unstaged.files,
      false
    );

    // 先暂存全部 // todo: is it safe
    await this.gitService.stageAll();
    const diff = await this.gitService.getStagedDiff();

    // 仅在未改变且在 amend 模式下才执行 amend
    const isAmendMode = !diff && this.emptyChangeBehavior === "amend";
    // this.outputChannel.info({ diff, isAmendMode });

    if (!diff && !isAmendMode) {
      throw new Error("No changes to commit");
    }

    let lastMessage = "";
    if (isAmendMode) {
      // Amend mode - get last commit message
      lastMessage = await this.gitService.getLastCommitMessage();
      if (!lastMessage) {
        throw new Error("No previous commit found to amend");
      }
    }

    // Create webview panel
    const panel = await this.webviewManager.createWebviewPanel();

    this.logger.info("== Initialing data...");
    // Send initial data to webview
    const data = {
      type: "init",
      message: lastMessage,
      isAmendMode,
      stagedFiles: {
        files: stagedFileChanges,
        additions: changedFiles.staged.additions,
        deletions: changedFiles.staged.deletions,
        summary: changedFiles.staged.summary,
      },
      unstagedFiles: {
        files: unstagedFileChanges,
        additions: changedFiles.unstaged.additions,
        deletions: changedFiles.unstaged.deletions,
        summary: changedFiles.unstaged.summary,
      },
      totalAdditions:
        changedFiles.staged.additions + changedFiles.unstaged.additions,
      totalDeletions:
        changedFiles.staged.deletions + changedFiles.unstaged.deletions,
    };
    this.logger.info("== Initial data:", JSON.stringify(data, null, 2));
    panel.webview.postMessage(data);
  }
}
