import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";

export class WebviewManager {
  private webviewPanel?: vscode.WebviewPanel;
  private readonly scriptUri: vscode.Uri;
  private readonly template: HandlebarsTemplateDelegate;

  /**
   * 需要先初始化一个 template webview 页面，然后再动态加载新的内容（前端打包后的结果）
   */
  private readonly templatePath: string;

  /**
   * 前端打包后的脚本文件路径
   */
  private readonly scriptPath: string;

  private originalTabSetting?: string | null;

  constructor(
    context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    private readonly outputChannel: vscode.OutputChannel,
    templatePath: string = "./assets/webview.template.html",
    scriptPath: string = "./dist/webview-ui/main.js"
  ) {
    this.outputChannel.appendLine("[WebviewManager] Initializing...");

    // load template
    this.templatePath = templatePath;
    this.templatePath = path.join(context.extensionPath, this.templatePath);
    const templateContent = fs.readFileSync(this.templatePath, "utf8");
    this.template = Handlebars.compile(templateContent);

    // load script
    this.scriptPath = scriptPath;
    this.scriptUri = vscode.Uri.joinPath(context.extensionUri, this.scriptPath);

    // watch for file changes
    const mainJsPath = path.join(
      context.extensionPath,
      "dist",
      "webview-ui",
      "main.js"
    );
    this.outputChannel.appendLine(`Watching file: ${mainJsPath}`);

    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(
        vscode.Uri.file(path.dirname(mainJsPath)),
        path.basename(mainJsPath)
      )
    );
    type WatcherEvent = "onDidChange" | "onDidCreate" | "onDidDelete";
    const events: WatcherEvent[] = [
      "onDidChange",
      "onDidCreate",
      "onDidDelete",
    ];
    events.forEach((event) => {
      const watcherEvent = watcher[event] as vscode.Event<vscode.Uri>;
      watcherEvent((uri) => {
        this.outputChannel.appendLine(`File ${event}: ${uri.fsPath}`);
        if (this.webviewPanel?.webview) {
          this.updateWebview();
        } else {
          this.outputChannel.appendLine("Webview panel not available");
        }
      });
    });

    // register webview
    context.subscriptions.push(watcher, this);
  }

  public show(options: vscode.WebviewPanelOptions & vscode.WebviewOptions) {
    if (this.webviewPanel) {
      this.webviewPanel.reveal();
      return this.webviewPanel;
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

    // Only move to new window in window mode
    if (this.uiMode === "window") {
      vscode.commands.executeCommand("workbench.action.moveEditorToNewWindow");
      // Store original setting and hide tab bar in the new window
      this.originalTabSetting = vscode.workspace.getConfiguration().get("workbench.editor.showTabs");
      vscode.workspace.getConfiguration().update("workbench.editor.showTabs", "none", vscode.ConfigurationTarget.Window);
    }

    this.handleWindowModeStateChange(this.webviewPanel);
    this.updateWebview();
    return this.webviewPanel;
  }

  public createWebviewPanel(): vscode.WebviewPanel {
    const panel = this.show({});

    // Add message handling
    panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case "openExternal":
            if (message.url) {
              vscode.env.openExternal(vscode.Uri.parse(message.url));
            }
            break;
        }
      },
      undefined,
      []
    );

    return panel;
  }

  private cleanupPanel() {
    if (this.webviewPanel) {
      this.outputChannel.appendLine("[cleanupPanel] Disposing webview panel");
      // Restore original tab setting if in window mode
      if (this.uiMode === "window" && this.originalTabSetting !== undefined) {
        vscode.workspace.getConfiguration().update(
          "workbench.editor.showTabs",
          this.originalTabSetting,
          vscode.ConfigurationTarget.Window
        );
        this.originalTabSetting = undefined;
      }
      this.webviewPanel.dispose();
      this.webviewPanel = undefined;
      this.outputChannel.appendLine(
        "[cleanupPanel] Panel disposed and reference cleared"
      );
    }
  }

  private handleWindowModeStateChange(panel: vscode.WebviewPanel) {
    if (this.uiMode === "window") {
      this.outputChannel.appendLine(
        "[handleWindowModeStateChange] Setting up window mode handlers"
      );

      // Handle close button via message
      panel.webview.onDidReceiveMessage(
        (message: any) => {
          this.outputChannel.appendLine(
            `[onDidReceiveMessage] Received message: ${JSON.stringify(message)}`
          );
          if (message.type === "window-close") {
            this.outputChannel.appendLine(
              "[onDidReceiveMessage] Handling window close"
            );
            this.cleanupPanel();
          }
        },
        undefined,
        []
      );

      // Handle window close
      panel.onDidDispose(() => {
        this.outputChannel.appendLine(
          "[onDidDispose] Panel disposed event triggered"
        );
        this.webviewPanel = undefined;
      });

      // Handle visibility changes
      let lastVisible = true;
      panel.onDidChangeViewState((e) => {
        const currentVisible = e.webviewPanel.visible;
        const active = e.webviewPanel.active;
        this.outputChannel.appendLine(
          `[onDidChangeViewState] State changed - visible: ${currentVisible}, active: ${active}, lastVisible: ${lastVisible}`
        );

        // Only trigger on visibility change from true to false
        if (lastVisible && !currentVisible) {
          this.outputChannel.appendLine(
            "[onDidChangeViewState] Visibility changed from true to false, cleaning up panel"
          );
          this.cleanupPanel();
        }
        lastVisible = currentVisible;
      });
    }
  }

  private updateWebview() {
    if (!this.webviewPanel?.webview) return;

    const templateData = {
      scriptUri: this.webviewPanel.webview
        .asWebviewUri(this.scriptUri)
        .toString(),
      cspSource: this.webviewPanel.webview.cspSource,
      windowMode: this.uiMode === "window",
    };

    const html = this.template(templateData);
    this.webviewPanel.webview.html = html;
  }

  public get uiMode() {
    return (
      vscode.workspace.getConfiguration("yaac").get<string>("ui.mode") ||
      "panel"
    );
  }

  public dispose() {
    this.webviewPanel?.dispose();
  }
}
