import * as vscode from "vscode";

export class WebviewManager {
  private webviewPanel: vscode.WebviewPanel | undefined;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly mainJsPath: vscode.Uri;
  private readonly debounceTime = 100;
  private lastUpdate = 0;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    outputChannel?: vscode.OutputChannel
  ) {
    this.outputChannel =
      outputChannel || vscode.window.createOutputChannel("WebviewManager");
    this.mainJsPath = vscode.Uri.joinPath(
      context.extensionUri,
      "dist",
      "webview-ui",
      "main.js"
    );
    this.setupFileWatcher();
  }

  private setupFileWatcher() {
    try {
      // Watch the dist/webview-ui directory for changes
      const pattern = new vscode.RelativePattern(
        this.context.extensionUri,
        "dist/webview-ui/**"
      );
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      // Combine all file events into a single handler
      ["onDidChange", "onDidCreate", "onDidDelete"].forEach((event) => {
        watcher[event]((uri) => {
          this.outputChannel.appendLine(`${event}: ${uri.fsPath}`);
          this.refreshWebview();
        });
      });

      // Cleanup
      this.context.subscriptions.push(watcher);
      this.context.subscriptions.push(this);
    } catch (error) {
      this.outputChannel.appendLine(`Error setting up file watcher: ${error}`);
    }
  }

  private refreshWebview() {
    const now = Date.now();
    if (now - this.lastUpdate < this.debounceTime) return;
    this.lastUpdate = now;

    if (this.webviewPanel) {
      try {
        this.updateWebview();
        this.outputChannel.appendLine("Webview refreshed");
      } catch (error) {
        this.outputChannel.appendLine(`Refresh error: ${error}`);
      }
    }
  }

  private updateWebview() {
    if (!this.webviewPanel) return;

    const scriptUri = this.webviewPanel.webview.asWebviewUri(this.mainJsPath);
    const csp = [
      "default-src 'none'",
      `style-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
      `script-src ${this.webviewPanel.webview.cspSource} 'unsafe-inline'`,
      `img-src ${this.webviewPanel.webview.cspSource} https: data:`,
      `connect-src ${this.webviewPanel.webview.cspSource} https:`,
    ].join(";");

    this.webviewPanel.webview.html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          <title>${this.title}</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${scriptUri}?v=${Date.now()}"></script>
        </body>
      </html>`;
  }

  public createOrShowWebview(
    options: vscode.WebviewPanelOptions & vscode.WebviewOptions
  ) {
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

    this.updateWebview();
    this.webviewPanel.onDidDispose(() => (this.webviewPanel = undefined));
    return this.webviewPanel;
  }

  public getWebviewPanel() {
    return this.webviewPanel;
  }

  public dispose() {
    this.webviewPanel?.dispose();
  }
}
