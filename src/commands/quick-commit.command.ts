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
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private lastUpdate: number = 0;

  constructor(
    gitService: VscodeGitService,
    solutionManager: SolutionManager,
    context: vscode.ExtensionContext
  ) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel("YAAC");

    // Set up file watching for the webview UI
    this.setupFileWatcher();

    // Clean up file watcher when extension is deactivated
    context.subscriptions.push(this);
  }

  private setupFileWatcher() {
    try {
      // Create a workspace folder for the extension
      const extensionWorkspaceFolder = { 
        uri: this.context.extensionUri,
        name: 'YAAC Extension',
        index: 0
      };

      const pattern = new vscode.RelativePattern(
        extensionWorkspaceFolder,
        'dist/webview-ui/**'
      );

      this.outputChannel.appendLine(`Setting up file watcher with pattern: ${pattern.pattern}`);
      
      // Create the file watcher
      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

      // Log when watcher is created
      this.outputChannel.appendLine('File watcher created successfully');

      // Watch for all file system events
      this.fileWatcher.onDidChange((uri) => {
        this.outputChannel.appendLine(`File changed: ${uri.fsPath}`);
        this.refreshWebview();
      });

      this.fileWatcher.onDidCreate((uri) => {
        this.outputChannel.appendLine(`File created: ${uri.fsPath}`);
        this.refreshWebview();
      });

      this.fileWatcher.onDidDelete((uri) => {
        this.outputChannel.appendLine(`File deleted: ${uri.fsPath}`);
        this.refreshWebview();
      });

      // Also watch the main.js file directly
      const mainJsPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        'dist',
        'webview-ui',
        'main.js'
      );

      // Set up fs.watch as a backup
      const fs = require('fs');
      const path = require('path');
      
      fs.watch(path.dirname(mainJsPath.fsPath), (eventType: string, filename: string) => {
        if (filename === 'main.js') {
          this.outputChannel.appendLine(`File system event: ${eventType} - ${filename}`);
          this.refreshWebview();
        }
      });

    } catch (error) {
      this.outputChannel.appendLine(`Error setting up file watcher: ${error}`);
    }
  }

  public dispose(): void {
    this.fileWatcher?.dispose();
    this.webviewPanel?.dispose();
  }

  private refreshWebview() {
    const now = Date.now();
    // Debounce updates to prevent multiple refreshes
    if (now - this.lastUpdate < 100) {
      return;
    }
    this.lastUpdate = now;

    if (this.webviewPanel) {
      this.outputChannel.appendLine("Refreshing webview content");
      try {
        this.updateWebview(this.webviewPanel.webview);
        this.outputChannel.appendLine("Webview content updated successfully");
      } catch (error) {
        this.outputChannel.appendLine(`Error updating webview: ${error}`);
      }
    }
  }

  private updateWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "webview-ui",
        "main.js"
      )
    );

    // Add cache-busting query parameter
    const scriptSrc = `${scriptUri}?v=${Date.now()}`;

    const csp = `default-src 'none';
      style-src ${webview.cspSource} 'unsafe-inline';
      script-src ${webview.cspSource} 'unsafe-inline';
      img-src ${webview.cspSource} https: data:;
      connect-src ${webview.cspSource} https:;`;

    webview.html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          <title>Quick Commit</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${scriptSrc}"></script>
        </body>
      </html>`;
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
          vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview-ui"),
        ],
        retainContextWhenHidden: true,
      }
    );

    this.updateWebview(panel.webview);
    this.webviewPanel = panel;

    // When the panel is closed, clean up resources
    panel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });

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
