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

    // Add development mode watcher
    if (process.env["NODE_ENV"] === "development") {
      this.watchFileSystem()
    }

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
    const indexPath = path.join(this.webviewPath, "index.html")
    const scriptPath = path.join(this.webviewPath, "main.js")

    if (!fs.existsSync(indexPath)) {
      throw new Error(`Template file not found: ${indexPath}`)
    }

    const template = fs.readFileSync(indexPath, "utf-8")
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
    if (process.env["NODE_ENV"] === "development") {
      const watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(this.webviewPath, "**/*"),
      )

      watcher.onDidChange(async () => {
        await this.updateWebview()
      })

      this.context.subscriptions.push(watcher)
    }
  }

  dispose() {
    this.cleanup()
  }
}
