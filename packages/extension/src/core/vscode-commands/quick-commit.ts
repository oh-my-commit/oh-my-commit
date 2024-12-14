import { AcManager } from "@/core/ac";
import { VscodeCommand } from "@/core/vscode-commands/types";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import { CommitEvent } from "@yaac/shared/types/commit";

import * as vscode from "vscode";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";
  public name = "Quick Commit";

  private gitService: VscodeGitService;
  private webviewManager: WebviewManager;
  private acManager: AcManager;
  private logger: vscode.LogOutputChannel;

  constructor(
    gitService: VscodeGitService,
    _acManager: AcManager,
    context: vscode.ExtensionContext,
    logger: vscode.LogOutputChannel
  ) {
    this.gitService = gitService;
    this.acManager = _acManager;
    this.logger = logger;

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

    this.webviewManager.registerMessageHandler("get-commit-data", async () => {
      logger.info("Received request for commit data");
      const diffSummary = await this.gitService.getDiffSummary();
      const changeSummary = await this.gitService.getChangeSummary();
      const message = await this.acManager.generateCommit(diffSummary);
      if (!message.isOk()) {
        this.logger.error("Failed to generate commit message");
        return;
      }
      const commitData: CommitEvent = {
        type: "commit",
        diffSummary: changeSummary,
        message: message.value,
      };
      this.logger.info(this.name, commitData);

      // 发送消息给 webview
      await this.webviewManager.postMessage(commitData);
    });

    // Clean up file watcher when extension is deactivated
    context.subscriptions.push(this);
  }

  get config() {
    return vscode.workspace.getConfiguration("yaac");
  }

  get emptyChangeBehavior() {
    return this.config.get<string>("emptyChangeBehavior", "skip");
  }

  public dispose(): void {
    this.webviewManager.dispose();
  }

  /**
   * 无需 handle error，因为最外层 @command.manager.ts 会处理
   */
  async execute(): Promise<void> {
    await this.webviewManager.createWebviewPanel();
  }
}
