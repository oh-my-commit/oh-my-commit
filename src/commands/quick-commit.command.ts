import { VscodeCommand } from "@/commands/types";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "@/managers/solution.manager";
import * as vscode from "vscode";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private solutionManager: SolutionManager;
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;
  private webviewPanel: vscode.WebviewPanel | undefined;

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
    // 重用已存在的 panel
    if (this.webviewPanel) {
      this.webviewPanel.reveal();
    } else {
      this.webviewPanel = this.createWebviewPanel();

      // 当 panel 关闭时清除引用
      this.webviewPanel.onDidDispose(
        () => {
          this.webviewPanel = undefined;
        },
        null,
        this.context.subscriptions
      );
    }

    // Send initial data to webview
    this.webviewPanel.webview.postMessage({
      command: "setInitialMessage",
      message: initialMessage,
    });

    this.webviewPanel.webview.postMessage({
      command: "setAmendMode",
      isAmendMode,
    });

    // Get recent commits for the list
    const recentCommits = await this.gitService.getRecentCommits(5);
    this.webviewPanel.webview.postMessage({
      command: "setCommits",
      commits: recentCommits,
    });

    // Handle messages from webview
    this.webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "commit":
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
                  await this.gitService.amendCommit(message.message);
                } else {
                  await this.gitService.stageAll();
                  await this.gitService.commit(message.message);
                }
                this.webviewPanel?.dispose();
              }
            );
            break;
          case "cancel":
            this.webviewPanel?.dispose();
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private createWebviewPanel() {
    const panel = vscode.window.createWebviewPanel(
      "yaacCommit",
      "Quick Commit",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview"),
          vscode.Uri.parse("http://localhost:5173"), // 允许访问 Vite 开发服务器
          vscode.Uri.parse("ws://localhost:5173"), // 允许 WebSocket 连接
        ],
        retainContextWhenHidden: true,
      }
    );

    // 设置 CSP
    const nonce = this.getNonce();
    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      process.env.VSCODE_DEBUG === "true";
    console.log({
      isDevelopment,
      NODE_ENV: process.env.NODE_ENV,
      VSCODE_DEBUG: process.env.VSCODE_DEBUG,
    });

    // 在开发模式下允许连接 Vite 开发服务器
    const csp = isDevelopment
      ? `default-src 'none';
        style-src ${panel.webview.cspSource} 'unsafe-inline' http://localhost:5173;
        script-src ${panel.webview.cspSource} 'unsafe-inline' http://localhost:5173 'unsafe-eval';
        font-src ${panel.webview.cspSource};
        connect-src http://localhost:5173 ws://localhost:5173 wss://localhost:5173;
        img-src ${panel.webview.cspSource} http://localhost:5173 data:;`
      : `default-src 'none';
        style-src ${panel.webview.cspSource} 'unsafe-inline';
        script-src ${panel.webview.cspSource} 'nonce-${nonce}';
        font-src ${panel.webview.cspSource};`;

    let scriptUri, styleUri;

    if (isDevelopment) {
      // 开发模式：使用 Vite 开发服务器
      scriptUri = "http://localhost:5173/@vite/client";
      styleUri = "http://localhost:5173/src/styles.css";
    } else {
      // 生产模式：使用构建后的文件
      scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(
          this.context.extensionUri,
          "dist",
          "webview",
          "main.js"
        )
      );
      styleUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(
          this.context.extensionUri,
          "dist",
          "webview",
          "main.css"
        )
      );
    }

    panel.webview.html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          ${isDevelopment ? "" : `<link href="${styleUri}" rel="stylesheet">`}
          <title>Quick Commit</title>
        </head>
        <body>
          <div id="root"></div>
          ${
            isDevelopment
              ? `
            <script type="module" src="${scriptUri}"></script>
            <script type="module" src="http://localhost:5173/src/main.tsx"></script>
          `
              : `<script nonce="${nonce}" type="module" src="${scriptUri}"></script>`
          }
        </body>
      </html>`;

    return panel;
  }

  private getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
