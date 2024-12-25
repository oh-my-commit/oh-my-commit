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
  private _title: string
  private readonly webviewPath: string
  private readonly isDevelopment: boolean
  private fileWatcher?: vscode.FileSystemWatcher

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(VSCODE_TOKENS.Context) private readonly context: vscode.ExtensionContext,
    {
      title = `${APP_NAME} Webview`,
    }: {
      title?: string
    } = {},
  ) {
    this._title = title
    this.webviewPath = path.join(this.context.extensionPath, "..", "webview", "dist")
    this.isDevelopment = process.env.NODE_ENV === "development"

    if (this.isDevelopment) {
      this.setupHotReload()
    }
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

    // Set up file watcher
    const watcher = this.setupFileWatcher(panel)

    this.webviewPanel = panel
    await this.updateWebview()

    // Clean up
    panel.onDidDispose(() => {
      this.logger.info("Panel disposed, cleaning up...")
      watcher.dispose()
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

  private setupFileWatcher(panel: vscode.WebviewPanel) {
    const mainJsPath = path.join(this.webviewPath, "main.js")

    // this.logger.info(`Main.js path: ${mainJsPath}`);

    // Verify paths exist
    if (!fs.existsSync(mainJsPath)) {
      this.logger.error(`Main.js not found at: ${mainJsPath}`)
    }

    // Watch the compiled main.js file
    fs.watchFile(mainJsPath, { interval: 300 }, async (curr, prev) => {
      const currTime = curr.mtime.getTime()
      const prevTime = prev.mtime.getTime()

      this.logger.info("File change detected in main.js:")
      this.logger.info(`Path: ${mainJsPath}`)
      this.logger.info(`Previous: ${prev.mtime.toISOString()} (${prevTime})`)
      this.logger.info(`Current: ${curr.mtime.toISOString()} (${currTime})`)

      if (currTime !== prevTime) {
        this.logger.info("Timestamps differ, reloading webview...")
        await this.updateWebview()
      } else {
        this.logger.info("Timestamps match, skipping reload")
      }
    })

    // Cleanup
    const cleanup = () => {
      this.logger.info("Cleaning up file watchers...")
      fs.unwatchFile(mainJsPath)
    }

    panel.onDidDispose(cleanup)

    return { dispose: cleanup }
  }

  private setupHotReload() {
    this.logger.info("Setting up hot reload for development mode")

    // Watch for changes in the webview dist directory
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.webviewPath, "**/*"),
      false, // Don't ignore creates
      false, // Don't ignore changes
      false, // Don't ignore deletes
    )

    // Handle file changes
    this.fileWatcher.onDidChange(() => this.handleFileChange())
    this.fileWatcher.onDidCreate(() => this.handleFileChange())
    this.fileWatcher.onDidDelete(() => this.handleFileChange())

    // Add to disposables
    this.context.subscriptions.push(this.fileWatcher)
  }

  private async handleFileChange() {
    this.logger.info("Detected file change in webview, reloading...")
    if (this.webviewPanel) {
      await this.updateWebview()
      this.logger.info("Webview reloaded successfully")
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

    const html = this.getWebviewContent()
    this.webviewPanel.webview.html = html
    this.logger.info("Webview updated successfully")
  }

  private async cleanup() {
    this.fileWatcher?.dispose()
    if (this.webviewPanel) {
      this.logger.info("Disposing webview panel")

      // await this.restoreWindowState();

      // Dispose the panel
      this.webviewPanel.dispose()
      this.webviewPanel = undefined

      this.logger.debug("Panel disposed and reference cleared")
    }
  }

  dispose() {
    this.cleanup()
  }
}
