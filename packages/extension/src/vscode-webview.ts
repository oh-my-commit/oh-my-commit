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
  private title: string

  @Inject(TOKENS.Logger) private readonly logger!: VscodeLogger

  @Inject(TOKENS.Config) private readonly config!: VscodeConfig

  @Inject(VSCODE_TOKENS.Context) private readonly context!: vscode.ExtensionContext

  /**
   * 需要先初始化一个 template webview 页面，然后再动态加载新的内容（前端打包后的结果）
   */
  private readonly templatePath: string

  /**
   * 前端打包后的脚本文件路径
   */
  private readonly scriptPath: string

  constructor({
    title = `${APP_NAME} Webview`,
    templatePath = "assets/webview.template.html",
    scriptPath = "dist/webview-ui/main.js",
  }: {
    title?: string
    templatePath?: string
    scriptPath?: string
  } = {}) {
    this.title = title
    this.templatePath = templatePath
    this.scriptPath = scriptPath
  }

  initialize() {
    this.logger.info("Initializing webview .")
    this.context.subscriptions.push(this)
    this.logger.info("Initializing webview ..")
  }

  setMessageHandler(handler: (message: ClientMessageEvent) => Promise<void>) {
    this.messageHandler = handler
  }

  get template() {
    const templatePath = path.join(this.context.extensionPath, this.templatePath)
    const templateContent = fs.readFileSync(templatePath, "utf8")
    return Handlebars.compile(templateContent)
  }

  public get scriptUri() {
    return vscode.Uri.file(path.join(this.context.extensionPath, this.scriptPath))
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
          await this.cleanupPanel()
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

  public async dispose() {
    await this.cleanupPanel()
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
    const mainJsPath = path.join(this.context.extensionPath, this.scriptPath)

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

  private getWebviewOptions(): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    const options = {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "dist"))],
    }
    // this.logger.info("Webview options:", options);
    return options
  }

  private getCspSettings(): string {
    const webview = this.webviewPanel!.webview
    return `default-src 'none';
            img-src ${webview.cspSource} https: data:;
            script-src ${webview.cspSource} 'unsafe-inline';
            style-src ${webview.cspSource} 'unsafe-inline';
            font-src ${webview.cspSource};
            connect-src ws://localhost:8081 ${webview.cspSource};`
  }

  private getScriptUri(): vscode.Uri {
    const uri = this.webviewPanel!.webview.asWebviewUri(this.scriptUri)
    const finalUri = uri.with({ query: `v=${Date.now()}` })
    return finalUri
  }

  private async updateWebview() {
    if (!this.webviewPanel?.webview) {
      this.logger.warn("No webview panel available for update")
      return
    }

    const templateData = {
      scriptUri: this.getScriptUri().toString(),
      cspSource: this.getCspSettings(),
      windowMode: this.uiMode === "window",
    }

    this.logger.info("Updating webview with template data:", JSON.stringify(templateData, null, 2))
    const html = this.template(templateData)
    this.webviewPanel.webview.html = html
    this.logger.info("Webview updated successfully")
  }

  private async cleanupPanel() {
    if (this.webviewPanel) {
      this.logger.info("Disposing webview panel")

      // await this.restoreWindowState();

      // Dispose the panel
      this.webviewPanel.dispose()
      this.webviewPanel = undefined

      this.logger.debug("Panel disposed and reference cleared")
    }
  }
}
