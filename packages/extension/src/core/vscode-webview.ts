import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";
import { Loggable } from "@/types/mixins";

type MessageHandler = (message: any) => Promise<void>;
type LogLevel = "debug" | "info" | "warn" | "error" | "trace";

export class WebviewManager
  extends Loggable(class {})
  implements vscode.Disposable
{
  private webviewPanel?: vscode.WebviewPanel;
  private readonly scriptUri: vscode.Uri;
  private readonly template: HandlebarsTemplateDelegate;
  private persistWindowState: boolean;
  private savedStates: Record<string, any> = {};
  private messageHandlers: Map<string, MessageHandler> = new Map();

  /**
   * 需要先初始化一个 template webview 页面，然后再动态加载新的内容（前端打包后的结果）
   */
  private readonly templatePath: string;

  /**
   * 前端打包后的脚本文件路径
   */
  private readonly scriptPath: string;

  // 窗口模式下的目标配置
  private readonly windowModeConfigs = {
    // 工作区级别配置
    workspace: {
      "workbench.editor.showTabs": "none" as const,
      "workbench.editor.editorActionsLocation": "hidden" as const,
      "workbench.activityBar.location": "hidden" as const,
      "workbench.auxiliaryActivityBar.location": "hidden" as const,
    },
    // 用户级别配置
    user: {
      "window.titleBarStyle": "native" as const,
      "window.customTitleBarVisibility": "never" as const,
    },
  };

  private getWorkspaceConfig(
    key: keyof typeof this.windowModeConfigs.workspace
  ) {
    return this.windowModeConfigs.workspace[key];
  }

  private getUserConfig(key: keyof typeof this.windowModeConfigs.user) {
    return this.windowModeConfigs.user[key];
  }

  private context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    templatePath: string = "./assets/webview.template.html",
    scriptPath: string = "./dist/webview-ui/main.js",
    persistWindowState: boolean = false
  ) {
    super();
    this.context = context;
    this.logger.info(`Creating ${viewType} webview`);
    this.persistWindowState = persistWindowState;

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
          rawMessage
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

  public registerMessageHandler(command: string, handler: MessageHandler) {
    this.messageHandlers.set(command, handler);
  }

  public async show(
    options: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ) {
    // 检查 webviewPanel 是否存在且可用
    if (this.webviewPanel) {
      try {
        // 尝试访问 webview 属性，如果 panel 已被销毁会抛出异常
        const _ = this.webviewPanel.webview;
        this.webviewPanel.reveal();
        return this.webviewPanel;
      } catch (error) {
        this.logger.debug("Webview panel is disposed, creating new one");
        this.webviewPanel = undefined;
      }
    }

    // 创建新的 webview panel
    if (!this.webviewPanel) {
      // Only move to new window in window mode
      if (this.uiMode === "window") {
        await vscode.commands.executeCommand(
          "workbench.action.newEmptyEditorWindow"
        );
        await this.saveWindowState();
      }

      this.webviewPanel = vscode.window.createWebviewPanel(
        this.viewType,
        this.title,
        {
          viewColumn: vscode.ViewColumn.Active,
          preserveFocus: true,
        },
        {
          ...options,
          enableScripts: true,
          enableFindWidget: false,
          retainContextWhenHidden: this.uiMode !== "window",
        }
      );

      await this.handleWindowModeStateChange(this.webviewPanel);
      await this.updateWebview();
    }

    return this.webviewPanel;
  }

  public async createWebviewPanel(): Promise<vscode.WebviewPanel> {
    this.logger.info("Creating webview panel...");
    const panel = vscode.window.createWebviewPanel(
      "ohMyCommits",
      "Oh My Commits",
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true,
      },
      this.getWebviewOptions()
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
          ".."
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
      JSON.stringify(templateData, null, 2)
    );
    const html = this.template(templateData);
    this.webviewPanel.webview.html = html;
    this.logger.info("Webview updated successfully");
  }

  private async updateWorkspaceConfig(
    key: string,
    value: unknown,
    target: vscode.ConfigurationTarget
  ) {
    this.logger.debug(`Setting ${key} to ${value} (target: ${target})`);
    await vscode.workspace.getConfiguration().update(key, value, target);
  }

  private async saveWindowState() {
    if (this.uiMode === "window" && this.persistWindowState) {
      this.logger.info("Saving window state");
      for (const key of Object.keys(this.windowModeConfigs.workspace)) {
        // 保存当前值
        this.savedStates[key] = vscode.workspace.getConfiguration().get(key);
        this.logger.trace(
          `Saved window state: ${key}=${this.savedStates[key]}`
        );
        // 设置目标值
        await this.updateWorkspaceConfig(
          key,
          this.getWorkspaceConfig(
            key as keyof typeof this.windowModeConfigs.workspace
          ),
          vscode.ConfigurationTarget.Workspace
        );
      }

      // 保存和设置用户配置
      for (const key of Object.keys(this.windowModeConfigs.user)) {
        // 保存当前值
        this.savedStates[key] = vscode.workspace.getConfiguration().get(key);
        this.logger.trace(
          `Saved window state: ${key}=${this.savedStates[key]}`
        );
        // 设置目标值
        await this.updateWorkspaceConfig(
          key,
          this.getUserConfig(key as keyof typeof this.windowModeConfigs.user),
          vscode.ConfigurationTarget.Global
        );
      }

      this.logger.info("Window state saved");
    }
  }

  private async restoreWindowState() {
    if (
      this.uiMode === "window" &&
      this.persistWindowState &&
      Object.keys(this.savedStates).length > 0
    ) {
      for (const key of Object.keys(this.windowModeConfigs.workspace) as Array<
        keyof typeof this.windowModeConfigs.workspace
      >) {
        await vscode.workspace
          .getConfiguration()
          .update(
            key,
            this.getWorkspaceConfig(key),
            vscode.ConfigurationTarget.Workspace
          );
      }

      for (const key of Object.keys(this.windowModeConfigs.user) as Array<
        keyof typeof this.windowModeConfigs.user
      >) {
        await vscode.workspace
          .getConfiguration()
          .update(
            key,
            this.getUserConfig(key),
            vscode.ConfigurationTarget.Global
          );
      }

      // 清空保存的状态
      this.savedStates = {};
      this.logger.info("Window state restored");
    }
  }

  private async cleanupPanel() {
    if (this.webviewPanel) {
      this.logger.info("Disposing webview panel");

      await this.restoreWindowState();

      // Dispose the panel
      this.webviewPanel.dispose();
      this.webviewPanel = undefined;

      this.logger.debug("Panel disposed and reference cleared");
    }
  }

  private async handleWindowModeStateChange(panel: vscode.WebviewPanel) {
    if (this.uiMode === "window") {
      this.logger.info("Setting up window mode");

      // Handle window close
      panel.onDidDispose(() => {
        this.logger.debug("Panel disposed event triggered");
        this.webviewPanel = undefined;
      });

      // Handle keyboard shortcuts and window state changes
      let lastVisible = true;
      let lastActive = false;
      let isMovingToNewWindow = true; // Flag to track window mode transition

      panel.onDidChangeViewState((e) => {
        const currentVisible = e.webviewPanel.visible;
        const active = e.webviewPanel.active;
        this.logger.trace(
          `View state changed - visible: ${currentVisible}, active: ${active}, lastVisible: ${lastVisible}, lastActive: ${lastActive}, isMovingToNewWindow: ${isMovingToNewWindow}`
        );

        // Ignore the first active:false event when moving to new window
        if (isMovingToNewWindow && !active) {
          this.logger.debug("Ignoring focus loss during window transition");
          isMovingToNewWindow = false;
          lastActive = true; // Force lastActive to true since we're ignoring this transition
          lastVisible = currentVisible;
          return;
        }

        // Close when:
        // 1. Visibility changes from true to false, or
        // 2. Focus changes from active to inactive (after window transition), or
        // 3. Panel becomes hidden (handles cmd+w)
        if (
          (lastVisible && !currentVisible) ||
          (!active && lastActive && !isMovingToNewWindow) ||
          !e.webviewPanel.visible
        ) {
          this.logger.info(
            `Panel lost ${
              !currentVisible ? "visibility" : !active ? "focus" : "shown state"
            }`
          );
          this.cleanupPanel();
          return;
        }

        lastVisible = currentVisible;
        lastActive = active;
      });

      // Register keyboard shortcut handler
      const disposable = vscode.commands.registerCommand(
        "workbench.action.closeActiveEditor",
        () => {
          if (this.webviewPanel && this.webviewPanel.active) {
            this.logger.info("Handling cmd+w");
            this.cleanupPanel();
          }
        }
      );

      // Clean up the command registration when panel is disposed
      panel.onDidDispose(() => disposable.dispose());
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

  public get uiMode(): string {
    return (
      vscode.workspace
        .getConfiguration("oh-my-commits")
        .get<string>("ui.mode") ?? "panel"
    );
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
}
