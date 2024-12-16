import { AcManager } from "@/core/ac";
import { VscodeGitService } from "@/core/vscode-git";
import { WebviewManager } from "@/core/vscode-webview";
import { Loggable } from "@/types/mixins";
import { CommitData } from "@oh-my-commits/shared";

export interface CommitMessage {
  type: "commit";
  message: CommitData;
}

export interface DiffSummary {
  type: "diff-summary";
  diffSummary: any;
}

export type CommitWebviewMessage = CommitMessage | DiffSummary;

/**
 * 处理所有与 commit 相关的 webview 交互
 */
export class CommitWebviewService extends Loggable(class {}) {
  constructor(
    private readonly webviewManager: WebviewManager,
    private readonly gitService: VscodeGitService,
    private readonly acManager: AcManager
  ) {
    super();
    this.initializeHandlers();
  }

  private initializeHandlers() {
    // 处理 webview 准备就绪事件
    this.webviewManager.registerMessageHandler("webview-ready", () =>
      this.handleWebviewReady()
    );

    // 处理重新生成请求
    this.webviewManager.registerMessageHandler("regenerate-commit", (data) =>
      this.handleRegenerateCommit(data)
    );
  }

  /**
   * 发送消息到 webview
   */
  private async sendMessage(message: CommitWebviewMessage) {
    this.logger.info(">> commit webview: ", message);
    await this.webviewManager.postMessage(message);
  }

  /**
   * 处理 webview 准备就绪事件
   */
  private async handleWebviewReady() {
    this.logger.info("Webview ready, sending initial data");
    try {
      await this.sendInitialDiffSummary();
      await this.generateAndSendCommit();
    } catch (error) {
      this.logger.error("Error handling webview-ready:", error);
    }
  }

  /**
   * 发送初始的 diff 摘要
   */
  private async sendInitialDiffSummary() {
    const changeSummary = await this.gitService.getChangeSummary();
    await this.sendMessage({
      type: "diff-summary",
      diffSummary: changeSummary,
    });
  }

  /**
   * 生成并发送 commit 消息
   */
  private async generateAndSendCommit(selectedFiles?: string[]) {
    const diffSummary = await this.gitService.getDiffSummary();
    const filteredDiff = this.filterDiffByFiles(diffSummary, selectedFiles);

    const message = await this.acManager.generateCommit(filteredDiff);
    if (message.isOk()) {
      await this.sendMessage({
        type: "commit",
        message: message.value,
      });
    } else {
      this.logger.error("Failed to generate commit message");
    }
  }

  /**
   * 根据选中的文件过滤 diff
   */
  private filterDiffByFiles(diffSummary: any, selectedFiles?: string[]) {
    if (!selectedFiles) {
      return diffSummary;
    }

    return {
      ...diffSummary,
      files: diffSummary.files.filter((file: any) => {
        return (
          file &&
          "path" in file &&
          typeof file.path === "string" &&
          selectedFiles.includes(file.path)
        );
      }),
    };
  }

  /**
   * 处理重新生成请求
   */
  private async handleRegenerateCommit(data: { selectedFiles: string[] }) {
    this.logger.info(
      "Regenerating commit for selected files:",
      data.selectedFiles
    );
    try {
      await this.generateAndSendCommit(data.selectedFiles);
    } catch (error) {
      this.logger.error("Error handling regenerate-commit:", error);
    }
  }
}
