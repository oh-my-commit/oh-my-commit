import { AcManager } from "@/services/models.service";
import { BaseCommand } from "@/libs/vscode-command";
import { VscodeGitService } from "@/services/vscode-git.service";
import { VscodeWebview } from "@/libs/vscode-webview";
import { CommitWebviewService } from "@/services/commit-webview.service";
import { APP_NAME, COMMAND_QUICK_COMMIT } from "@oh-my-commits/shared";
import * as vscode from "vscode";

export class QuickCommitCommand extends BaseCommand {
  public id = COMMAND_QUICK_COMMIT;
  public name = "Quick Commit";

  private webviewManager: VscodeWebview;
  private commitWebviewService: CommitWebviewService;

  constructor(
    gitService: VscodeGitService,
    acManager: AcManager,
    context: vscode.ExtensionContext,
  ) {
    super();

    // 初始化 webview 管理器
    this.webviewManager = new VscodeWebview(context, {
      onReady: async () => {
        await this.sendInitialDiffSummary();
        await this.generateAndSendCommit();
      },
    });

    // 初始化 commit webview 服务
    this.commitWebviewService = new CommitWebviewService(
      this.webviewManager,
      gitService,
      acManager,
    );

    // Clean up file watcher when extension is deactivated
    context.subscriptions.push(this);
  }

  public dispose(): void {
    this.webviewManager.dispose();
  }

  async execute(): Promise<void> {
    await this.webviewManager.createWebviewPanel();
  }
}
