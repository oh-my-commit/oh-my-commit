import * as fs from "fs";
import * as Handlebars from "handlebars";
import * as path from "path";
import * as vscode from "vscode";

import { APP_ID, APP_NAME, LogLevel } from "@oh-my-commits/shared";

import { Loggable } from "@/types/mixins";

type MessageHandler = (message: any) => Promise<void>;

export class VscodeWebview
  extends Loggable(class {})
  implements vscode.Disposable
{
  private webviewPanel?: vscode.WebviewPanel;
  private readonly scriptUri: vscode.Uri;
  private readonly template: HandlebarsTemplateDelegate;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  /**
   * 需要先初始化一个 template webview 页面，然后再动态加载新的内容（前端打包后的结果）
   */
  private readonly templatePath: string;

  /**
   * 前端打包后的脚本文件路径
   */
  private readonly scriptPath: string;

  private context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    {
      viewType = "webview",
      title = "Webview",
      templatePath = "webview.html",
      scriptPath = "webview.html",
      onReady = () => {},
    }: {
      viewType?: string;
      title?: string;
      templatePath?: string;
      scriptPath?: string;
      onReady?: () => void;
    },
  ) {
    super();
    this.context = context;
    this.logger.info(`Creating ${viewType} webview`);

    this.registerMessageHandler("webview-ready", async () => {
      if (onReady) onReady();
    });

    // Register default handlers
    this.registerMessageHandler("openExternal", async (message) => {
      if (message.url) {
        await vscode.env.openExternal(vscode.Uri.parse(message.url));
      }
    });

    this.registerMessageHandler("window-close", async () => {
      this.logger.info("<< Handling window close");
      await this.cleanupPanel();
    });

    // Register log handler
    this.registerMessageHandler("log", async (message) => {
      if (message.payload) {
        const { channel, level, rawMessage } = message.payload;
        const normalizedLevel = this.normalizeLogLevel(level);

        this.logger[normalizedLevel](
          `[Host <-- ${channel ?? "Webview"}]: `,
          rawMessage,
        );
      }
    });

    // load template
    this.templatePath = templatePath;
    this.templatePath = path.join(context.extensionPath, this.templatePath);
    const templateContent = fs.readFileSync(this.templatePath, "utf8");
    this.template = Handlebars.compile(templateContent);

    // load script
    this.scriptPath = scriptPath;
    this.scriptUri = vscode.Uri.joinPath(context.extensionUri, this.scriptPath);

    // register webview
    context.subscriptions.push(this);
  }

  public get uiMode(): string {
    return this.config.get<string>("ohMyCommits.ui.mode")!;
  }

  public registerMessageHandler(command: string, handler: MessageHandler) {
    this.messageHandlers.set(command, handler);
  }

  public async createWebviewPanel(): Promise<vscode.WebviewPanel> {
    this.logger.info("Creating webview panel...");
    const panel = vscode.window.createWebviewPanel(
      APP_ID,
      APP_NAME,
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true,
      },
      this.getWebviewOptions(),
    );

    // Set up message handler
    panel.webview.onDidReceiveMessage(async (message) => {
      const handler = this.messageHandlers.get(message.command);
      if (handler) {
        try {
          await handler(message);
          this.logger.debug("Message handled successfully");
        } catch (error) {
          this.logger.error("Error handling message:", error);
        }
      } else {
        this.logger.warn(`No handler found for command: ${message.command}`);
      }
    });

    // Set up file watcher
    const watcher = this.setupFileWatcher(panel);

    this.webviewPanel = panel;
    await this.updateWebview();

    // Clean up
    panel.onDidDispose(() => {
      this.logger.info("Panel disposed, cleaning up...");
      watcher.dispose();
      if (this.webviewPanel === panel) {
        this.webviewPanel = undefined;
      }
    });

    return panel;
  }

  public async dispose() {
    await this.cleanupPanel();
  }

  public async postMessage(message: any) {
    if (this.webviewPanel?.webview) {
      this.logger.debug("Posting message to webview:", message);
      try {
        await this.webviewPanel.webview.postMessage(message);
        this.logger.debug("Message posted successfully");
      } catch (error) {
        this.logger.error("Error posting message:", error);
      }
    } else {
      this.logger.error("Cannot post message: webview panel not available");
    }
  }

  private setupFileWatcher(panel: vscode.WebviewPanel) {
    const mainJsPath = path.join(this.context.extensionPath, this.scriptPath);

    this.logger.info(`Main.js path: ${mainJsPath}`);

    // Verify paths exist
    if (!fs.existsSync(mainJsPath)) {
      this.logger.error(`Main.js not found at: ${mainJsPath}`);
    }

    // Watch the compiled main.js file
    fs.watchFile(mainJsPath, { interval: 300 }, async (curr, prev) => {
      const currTime = curr.mtime.getTime();
      const prevTime = prev.mtime.getTime();

      this.logger.info("File change detected in main.js:");
      this.logger.info(`Path: ${mainJsPath}`);
      this.logger.info(`Previous: ${prev.mtime.toISOString()} (${prevTime})`);
      this.logger.info(`Current: ${curr.mtime.toISOString()} (${currTime})`);

      if (currTime !== prevTime) {
        this.logger.info("Timestamps differ, reloading webview...");
        await this.updateWebview();
      } else {
        this.logger.info("Timestamps match, skipping reload");
      }
    });

    // Cleanup
    const cleanup = () => {
      this.logger.info("Cleaning up file watchers...");
      fs.unwatchFile(mainJsPath);
    };

    panel.onDidDispose(cleanup);

    return { dispose: cleanup };
  }

  private getWebviewOptions(): vscode.WebviewOptions &
    vscode.WebviewPanelOptions {
    const options = {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(
          vscode.Uri.file(path.dirname(this.scriptPath)),
          "..",
          "..",
        ),
      ],
    };
    this.logger.info("Webview options:", options);
    return options;
  }

  private getCspSettings(): string {
    const webview = this.webviewPanel!.webview;
    const csp = `default-src 'none';
            img-src ${webview.cspSource} https: data:;
            script-src ${webview.cspSource} 'unsafe-inline';
            style-src ${webview.cspSource} 'unsafe-inline';
            font-src ${webview.cspSource};`;
    return csp;
  }

  private getScriptUri(): vscode.Uri {
    const uri = this.webviewPanel!.webview.asWebviewUri(this.scriptUri);
    const finalUri = uri.with({ query: `v=${Date.now()}` });
    return finalUri;
  }

  private async updateWebview() {
    if (!this.webviewPanel?.webview) {
      this.logger.warn("No webview panel available for update");
      return;
    }

    const templateData = {
      scriptUri: this.getScriptUri().toString(),
      cspSource: this.getCspSettings(),
      windowMode: this.uiMode === "window",
    };

    this.logger.info(
      "Updating webview with template data:",
      JSON.stringify(templateData, null, 2),
    );
    const html = this.template(templateData);
    this.webviewPanel.webview.html = html;
    this.logger.info("Webview updated successfully");
  }

  private async cleanupPanel() {
    if (this.webviewPanel) {
      this.logger.info("Disposing webview panel");

      // await this.restoreWindowState();

      // Dispose the panel
      this.webviewPanel.dispose();
      this.webviewPanel = undefined;

      this.logger.debug("Panel disposed and reference cleared");
    }
  }

  private normalizeLogLevel(level: string): LogLevel {
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case "debug":
      case "info":
      case "warn":
      case "error":
      case "trace":
        return normalizedLevel as LogLevel;
      default:
        return "info"; // 默认使用 info 级别
    }
  }
}
