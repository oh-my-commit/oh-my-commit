/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as fs from "fs"
import * as Handlebars from "handlebars"
import * as path from "path"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { APP_ID_CAMEL, APP_NAME, TOKENS, type ClientMessageEvent } from "@shared/common"

import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VSCODE_TOKENS } from "./vscode-token"

@Service()
export class VscodeWebview implements vscode.Disposable {
  private webviewPanel?: vscode.WebviewPanel
  private webviewView?: vscode.WebviewView
  private messageHandler?: (message: ClientMessageEvent) => Promise<void>
  private title: string = `${APP_NAME} Webview`
  private readonly webviewPath: string
  private viewProvider?: vscode.WebviewViewProvider
  private currentViewType?: string

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(VSCODE_TOKENS.Context) private readonly context: vscode.ExtensionContext,
  ) {
    this.webviewPath = path.join(this.context.extensionPath, "..", "webview", "dist")

    // 注册 webview provider
    const registration = vscode.window.registerWebviewViewProvider("ohMyCommit.view", {
      resolveWebviewView: async webviewView => {
        this.webviewView = webviewView

        try {
          webviewView.webview.options = this.getWebviewOptions()
          webviewView.webview.html = this.getWebviewContent()

          // 设置消息处理器
          if (this.messageHandler) {
            webviewView.webview.onDidReceiveMessage(this.messageHandler)
          }

          webviewView.title = this.title
          webviewView.description = "Ready"
        } catch (error) {
          this.logger.error("Error initializing webview:", error)
          webviewView.description = "Error"
        }
      },
    })

    this.context.subscriptions.push(registration)
  }

  setMessageHandler(handler: (message: ClientMessageEvent) => Promise<void>) {
    this.messageHandler = handler
  }

  public get uiMode(): string {
    return this.config.get<string>("ohMyCommit.ui.mode")!
  }

  private getViewOptions(): { viewColumn: vscode.ViewColumn } {
    const location = this.config.get<string>("ohMyCommit.ui.viewLocation") || "editor"

    switch (location) {
      case "beside":
        return { viewColumn: vscode.ViewColumn.Beside }
      case "editor":
      default:
        return { viewColumn: vscode.ViewColumn.Active }
    }
  }

  public async createWebviewPanel(): Promise<vscode.WebviewPanel | undefined> {
    const location = this.config.get<string>("ohMyCommit.ui.viewLocation") || "editor"

    // 如果是活动栏视图，使用已注册的 webview provider
    if (location === "activitybar") {
      // 如果视图已经存在，直接显示
      if (this.webviewView) {
        this.webviewView.show(true)
        return undefined
      }

      // 否则，显示视图容器
      await vscode.commands.executeCommand("workbench.view.extension.ohMyCommit")
      return undefined
    }

    // 如果之前是活动栏视图，先清理
    if (this.webviewView) {
      // 不需要主动关闭视图，让用户自己控制
      this.webviewView = undefined
    }

    // 对于编辑器视图，保持原有逻辑
    if (this.webviewPanel) {
      this.webviewPanel.reveal()
      return this.webviewPanel
    }

    const viewOptions = this.getViewOptions()
    this.logger.info("Creating webview panel...", { viewOptions })
    const panel = vscode.window.createWebviewPanel(
      APP_ID_CAMEL,
      this.title,
      viewOptions.viewColumn,
      this.getWebviewOptions(),
    )

    try {
      panel.webview.html = this.getWebviewContent()

      // 设置消息处理器
      if (this.messageHandler) {
        panel.webview.onDidReceiveMessage(this.messageHandler)
      }

      panel.onDidDispose(() => {
        this.webviewPanel = undefined
      })

      this.webviewPanel = panel
      return panel
    } catch (error) {
      this.logger.error("Error initializing webview panel:", error)
      panel.dispose()
      throw error
    }
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

  private cleanup() {
    if (this.webviewPanel) {
      this.webviewPanel.dispose()
      this.webviewPanel = undefined
    }
    this.webviewView = undefined
    this.viewProvider = undefined
  }

  dispose() {
    this.cleanup()
  }
}
