import * as fs from "fs"
import * as Handlebars from "handlebars"
import * as path from "path"
import * as vscode from "vscode"

import {
  APP_ID_CAMEL,
  APP_NAME,
  TOKENS,
  type ClientMessageEvent,
  type LogLevel,
} from "@shared/common"

import _ from "lodash"
import { Inject, Service } from "typedi"
import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VSCODE_TOKENS } from "./vscode-token"

@Service()
export class VscodeWebview implements vscode.Disposable {
  private webviewPanel?: vscode.WebviewPanel
  private messageHandler?: (message: ClientMessageEvent) => Promise<void>
  private title: string = `${APP_NAME} Webview`
  private readonly webviewPath: string

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(VSCODE_TOKENS.Context) private readonly context: vscode.ExtensionContext,
  ) {
    this.webviewPath = path.join(this.context.extensionPath, "..", "webview", "dist")
  }

  setMessageHandler(handler: (message: ClientMessageEvent) => Promise<void>) {
    this.messageHandler = handler
  }

  public get uiMode(): string {
    return this.config.get<string>("ohMyCommit.ui.mode")!
  }

  public async createWebviewPanel(): Promise<vscode.WebviewPanel> {
    this.logger.info("Creating webview panel...")
    const panel = vscode.window.createWebviewPanel(
      APP_ID_CAMEL,
      APP_NAME,
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true,
      },
      this.getWebviewOptions(),
    )

    // Set up message handler
    panel.webview.onDidReceiveMessage(async (message: ClientMessageEvent) => {
      let level: LogLevel = "info"
      const webviewChannel: string = _.camelCase(message.channel ?? "default")
      delete message.channel
      switch (message.type) {
        case "log":
          level = message.data.level
          message = message.data.rawMessage
          break

        case "close-window":
          await this.cleanup()
          break

        case "open-external":
          await vscode.env.openExternal(vscode.Uri.parse(message.data.url))
          break
        default:
          if (this.messageHandler) {
            await this.messageHandler(message)
          }
          break
      }
      this.logger.setName(`webview.${webviewChannel}`)
      this.logger[level](message)
    })

    this.webviewPanel = panel
    await this.updateWebview()

    // Clean up
    panel.onDidDispose(() => {
      this.logger.info("Panel disposed, cleaning up...")
      if (this.webviewPanel === panel) {
        this.webviewPanel = undefined
      }
    })

    return panel
  }

  public async postMessage(message: any) {
    if (this.webviewPanel?.webview) {
      this.logger.debug("Posting message to webview:", message)
      try {
        await this.webviewPanel.webview.postMessage(message)
        this.logger.debug("Message posted successfully")
      } catch (error) {
        this.logger.error("Error posting message:", error)
      }
    } else {
      this.logger.error("Cannot post message: webview panel not available")
    }
  }

  private getWebviewOptions(): vscode.WebviewOptions {
    const options = {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(this.webviewPath)],
    }
    return options
  }

  private getWebviewContent() {
    const isDev = process.env["NODE_ENV"] === "development"
    const devServerHost = "http://localhost:18080"

    if (isDev) {
      const nonce = require("crypto").randomBytes(16).toString("base64")
      const csp = [
        `form-action 'none'`,
        `default-src ${this.webviewPanel?.webview.cspSource} ${devServerHost}`,
        `style-src ${this.webviewPanel?.webview.cspSource} ${devServerHost} 'unsafe-inline'`,
        `script-src ${devServerHost} 'unsafe-eval' 'nonce-${nonce}'`,
        `connect-src ${devServerHost} ws://localhost:18080/ws`,
      ].join("; ")

      return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="${csp}">
            <title>${this.title}</title>
        </head>
        <body>
            <div id="root"></div>
            <script type="module" nonce="${nonce}" src="${devServerHost}/main.js"></script>
        </body>
        </html>`
    }

    const indexPath = path.join(this.webviewPath, "index.html")
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Template file not found: ${indexPath}`)
    }

    const template = fs.readFileSync(indexPath, "utf-8")
    const scriptPath = path.join(this.webviewPath, "main.js")
    const scriptUri = this.webviewPanel?.webview.asWebviewUri(vscode.Uri.file(scriptPath))

    const compiled = Handlebars.compile(template)
    return compiled({
      scriptUri,
      cspSource: this.webviewPanel?.webview.cspSource,
    })
  }

  private async updateWebview() {
    if (!this.webviewPanel?.webview) {
      this.logger.warn("No webview panel available for update")
      return
    }

    try {
      const html = this.getWebviewContent()
      this.webviewPanel.webview.html = html
      this.logger.info("Webview updated successfully")
    } catch (error) {
      this.logger.error("Error updating webview:", error)
    }
  }

  private async cleanup() {
    if (this.webviewPanel) {
      this.logger.info("Disposing webview panel")

      // await this.restoreWindowState();

      // Dispose the panel
      this.webviewPanel.dispose()
      this.webviewPanel = undefined

      this.logger.debug("Panel disposed and reference cleared")
    }
  }

  private watchFileSystem() {
    // 移除文件监听，因为我们现在使用 webpack dev server
  }

  dispose() {
    this.cleanup()
  }
}
