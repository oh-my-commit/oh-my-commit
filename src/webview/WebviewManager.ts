import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class WebviewManager {
  private webviewPanel: vscode.WebviewPanel | undefined;
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private lastUpdate: number = 0;
  private outputChannel: vscode.OutputChannel;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly viewType: string,
    private readonly title: string,
    outputChannel?: vscode.OutputChannel
  ) {
    this.outputChannel =
      outputChannel || vscode.window.createOutputChannel("WebviewManager");
    this.setupFileWatcher();
    context.subscriptions.push(this);
  }

  private setupFileWatcher() {
    try {
      const extensionWorkspaceFolder = {
        uri: this.context.extensionUri,
        name: "Extension",
        index: 0,
      };

      const pattern = new vscode.RelativePattern(
        extensionWorkspaceFolder,
        "dist/webview-ui/**"
      );

      this.outputChannel.appendLine(
        `Setting up file watcher with pattern: ${pattern.pattern}`
      );

      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
      this.outputChannel.appendLine("File watcher created successfully");

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

      const mainJsPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "webview-ui",
        "main.js"
      );

      fs.watch(
        path.dirname(mainJsPath.fsPath),
        (eventType: string, filename: string) => {
          if (filename === "main.js") {
            this.outputChannel.appendLine(
              `File system event: ${eventType} - ${filename}`
            );
            this.refreshWebview();
          }
        }
      );
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
          <title>${this.title}</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${scriptSrc}"></script>
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

    this.updateWebview(this.webviewPanel.webview);

    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });

    return this.webviewPanel;
  }

  public getWebviewPanel() {
    return this.webviewPanel;
  }
}
