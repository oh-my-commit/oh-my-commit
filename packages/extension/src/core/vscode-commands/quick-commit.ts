import { AcManager } from "@/core/ac";
import { BaseCommand } from "@/core/vscode-commands/types";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import {
  APP_NAME,
  COMMAND_QUICK_COMMIT,
  CommitEvent,
} from "@oh-my-commits/shared";
import * as vscode from "vscode";

export class QuickCommitCommand extends BaseCommand {
  public id = COMMAND_QUICK_COMMIT;
  public name = "Quick Commit";

  private gitService: VscodeGitService;
  private webviewManager: WebviewManager;
  private acManager: AcManager;

  constructor(
    gitService: VscodeGitService,
    _acManager: AcManager,
    context: vscode.ExtensionContext
  ) {
    super();
    this.gitService = gitService;
    this.acManager = _acManager;

    this.webviewManager = new WebviewManager(context, "webview", APP_NAME);

    // 初始化时发送 diff 信息
    this.webviewManager.registerMessageHandler("webview-ready", async () => {
      this.logger.info("Webview ready, sending initial data");
      try {
        const changeSummary = await this.gitService.getChangeSummary();
        await this.webviewManager.postMessage({
          type: "diff-summary",
          diffSummary: changeSummary,
        });
        
        // 同时开始生成 commit message
        const diffSummary = await this.gitService.getDiffSummary();
        const message = await this.acManager.generateCommit(diffSummary);
        if (message.isOk()) {
          await this.webviewManager.postMessage({
            type: "commit",
            message: message.value,
          });
        } else {
          this.logger.error("Failed to generate commit message");
        }
      } catch (error) {
        this.logger.error("Error handling webview-ready:", error);
      }
    });

    // 处理重新生成请求
    this.webviewManager.registerMessageHandler("regenerate-commit", async (data: { selectedFiles: string[] }) => {
      this.logger.info("Regenerating commit for selected files:", data.selectedFiles);
      try {
        const diffSummary = await this.gitService.getDiffSummary();
        // 只使用选中的文件生成 commit
        const filteredDiff = {
          ...diffSummary,
          files: diffSummary.files.filter(file => data.selectedFiles.includes(file.path))
        };
        
        const message = await this.acManager.generateCommit(filteredDiff);
        if (message.isOk()) {
          await this.webviewManager.postMessage({
            type: "commit",
            message: message.value,
          });
        } else {
          this.logger.error("Failed to regenerate commit message");
        }
      } catch (error) {
        this.logger.error("Error handling regenerate-commit:", error);
      }
    });

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
