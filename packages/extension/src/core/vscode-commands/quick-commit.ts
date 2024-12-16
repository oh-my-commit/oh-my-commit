import { AcManager } from "@/core/ac";
import { BaseCommand } from "@/core/vscode-commands/types";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import { CommitWebviewService } from "@/core/commit-webview.service";
import { APP_NAME, COMMAND_QUICK_COMMIT } from "@oh-my-commits/shared";
import * as vscode from "vscode";

export class QuickCommitCommand extends BaseCommand {
  public id = COMMAND_QUICK_COMMIT;
  public name = "Quick Commit";

  private webviewManager: WebviewManager;
  private commitWebviewService: CommitWebviewService;

  constructor(
    gitService: VscodeGitService,
    acManager: AcManager,
    context: vscode.ExtensionContext
  ) {
    super();

    // 初始化 webview 管理器
    this.webviewManager = new WebviewManager(context, "webview", APP_NAME);

    // 初始化 commit webview 服务
    this.commitWebviewService = new CommitWebviewService(
      this.webviewManager,
      gitService,
      acManager
    );

    // Clean up file watcher when extension is deactivated
    context.subscriptions.push(this);
  }

  get emptyChangeBehavior() {
    return this.config.get<string>("emptyChangeBehavior", "skip");
  }

  public dispose(): void {
    this.webviewManager.dispose();
  }

  async execute(): Promise<void> {
    await this.webviewManager.createWebviewPanel();
  }
}
