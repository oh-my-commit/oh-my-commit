import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";

export class WebviewManager {
  private webviewPanel?: vscode.WebviewPanel;
  private readonly scriptUri: vscode.Uri;
  private readonly templatePath: string;
  private readonly template: HandlebarsTemplateDelegate;

  constructor(
    context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    private readonly outputChannel = vscode.window.createOutputChannel(
      "WebviewManager"
    )
  ) {
    this.scriptUri = vscode.Uri.joinPath(
      context.extensionUri,
      "dist/webview-ui/main.js"
    );
    this.templatePath = path.join(
      context.extensionPath,
      "src/webview/template.html"
    );

    // Compile template once during initialization
    const templateContent = fs.readFileSync(this.templatePath, "utf8");
    this.template = Handlebars.compile(templateContent);

    // Watch for file changes
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(context.extensionUri, "dist/webview-ui/**")
    );

    type WatcherEvent = 'onDidChange' | 'onDidCreate' | 'onDidDelete';
    const events: WatcherEvent[] = ['onDidChange', 'onDidCreate', 'onDidDelete'];
    
    events.forEach(event => {
      const watcherEvent = watcher[event] as vscode.Event<vscode.Uri>;
      watcherEvent(() => this.webviewPanel?.webview && this.updateWebview());
    });

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

    this.updateWebview();
    
    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });

    return this.webviewPanel;
  }

  private updateWebview() {
    if (!this.webviewPanel?.webview) return;

    try {
      const templateData = {
        csp: [
          "default-src 'none'",
          `style-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
          `script-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
          `img-src ${this.webviewPanel.webview.cspSource} https: data:`,
          `connect-src ${this.webviewPanel.webview.cspSource} https:`,
        ].join(";"),
        title: this.title,
        scriptUri: `${this.webviewPanel.webview.asWebviewUri(
          this.scriptUri
        )}?v=${Date.now()}`,
      };

      this.webviewPanel.webview.html = this.template(templateData);
      this.outputChannel.appendLine("Webview refreshed");
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
