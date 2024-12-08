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

  /**
   * 开发模式监听的文件变动位置
   */
  private readonly watchDir: string;

  constructor(
    context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    private readonly outputChannel = vscode.window.createOutputChannel(
      "WebviewManager"
    ),
    templatePath: string = "./assets/webview.template.html",
    scriptPath: string = "./dist/webview-ui/main.js",
    watchDir: string = "dist/webview-ui"
  ) {
    // load template
    this.templatePath = templatePath;
    this.templatePath = path.join(context.extensionPath, this.templatePath);
    const templateContent = fs.readFileSync(this.templatePath, "utf8");
    this.template = Handlebars.compile(templateContent);

    // load script
    this.scriptPath = scriptPath;
    this.scriptUri = vscode.Uri.joinPath(context.extensionUri, this.scriptPath);

    // watch for file changes
    this.watchDir = watchDir;
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

  public createWebviewPanel(): vscode.WebviewPanel {
    if (this.webviewPanel) {
      this.webviewPanel.reveal();
      return this.webviewPanel;
    }

    this.webviewPanel = vscode.window.createWebviewPanel(
      this.viewType,
      this.title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.webviewPanel.webview.onDidReceiveMessage(
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

    this.updateWebview();

    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });

    return this.webviewPanel;
  }

  private updateWebview() {
    if (!this.webviewPanel?.webview) return;

    try {
      // Force clear cache by adding timestamp
      const timestamp = Date.now();
      this.outputChannel.appendLine(`Updating webview at ${timestamp}`);

      const templateData = {
        csp: [
          "default-src 'none'",
          `style-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
          `script-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
          `font-src ${this.webviewPanel.webview.cspSource}`,
          `img-src ${this.webviewPanel.webview.cspSource} https: data:`,
          `connect-src ${this.webviewPanel.webview.cspSource} https:`,
          "frame-src https:",
        ].join(";"),
        title: this.title,
        scriptUri: `${this.webviewPanel.webview.asWebviewUri(
          this.scriptUri
        )}?v=${timestamp}`,
      };

      this.webviewPanel.webview.html = this.template(templateData);
      this.outputChannel.appendLine("Webview refreshed successfully");
    } catch (error) {
      this.outputChannel.appendLine(`Refresh error: ${error}`);
    }
  }

  public show(options: vscode.WebviewPanelOptions & vscode.WebviewOptions) {
    if (this.webviewPanel) {
      this.webviewPanel.reveal();
      return this.webviewPanel;
    }

    this.webviewPanel = vscode.window.createWebviewPanel(
      this.viewType,
      this.title,
      vscode.ViewColumn.Active,
      options
    );

    this.webviewPanel.onDidDispose(() => (this.webviewPanel = undefined));
    this.updateWebview();
    return this.webviewPanel;
  }

  public dispose() {
    this.webviewPanel?.dispose();
  }
}
