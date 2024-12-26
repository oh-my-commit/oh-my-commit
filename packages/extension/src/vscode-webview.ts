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

import type { ClientMessageEvent, ServerMessageEvent } from "@shared/common"
import { APP_ID_CAMEL, APP_NAME, TOKENS } from "@shared/common"

import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { VSCODE_TOKENS } from "./vscode-token"

@Service()
export class VscodeWebview implements vscode.Disposable {
  private webviewPanel?: vscode.WebviewPanel
  private webviewView?: vscode.WebviewView
  private messageHandler?: (message: ClientMessageEvent) => Promise<void>
  private title: string = `${APP_NAME} Webview`
  private readonly webviewPath: string

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

          // 处理视图关闭
          webviewView.onDidDispose(() => {
            if (this.webviewView === webviewView) {
              this.webviewView = undefined
            }
          })
        } catch (error) {
          this.logger.error("Error initializing webview:", error)
          webviewView.description = "Error"
        }
      },
    })

    this.context.subscriptions.push(registration)

    // 监听配置变化
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(async e => {
        if (e.affectsConfiguration("ohMyCommit.ui.viewLocation")) {
          const location = this.getLocation()
          this.logger.info("View location changed:", { location })

          // 如果切换到编辑器模式，且当前在侧边栏中
          if (location === "beside" && this.webviewView) {
            this.logger.info("Switching to editor mode")
            // 保存当前内容和状态
            const content = this.webviewView.webview.html
            const messageHandler = this.messageHandler

            // 创建编辑器面板
            const panel = vscode.window.createWebviewPanel(
              APP_ID_CAMEL,
              this.title,
              this.getViewOptions().viewColumn,
              this.getWebviewOptions(),
            )

            // 恢复内容和处理器
            panel.webview.html = content
            if (messageHandler) {
              panel.webview.onDidReceiveMessage(messageHandler)
            }

            panel.onDidDispose(() => {
              if (this.webviewPanel === panel) {
                this.webviewPanel = undefined
              }
            })

            this.webviewPanel = panel
          }
          // 如果切换到侧边栏模式，且当前在编辑器中
          else if (location === "activitybar" && this.webviewPanel) {
            this.logger.info("Switching to activitybar mode")
            // 关闭编辑器面板，让它自动通过 provider 重新创建
            this.webviewPanel.dispose()
            this.webviewPanel = undefined

            // 打开侧边栏视图
            await vscode.commands.executeCommand("workbench.view.extension.ohMyCommit")
          }
        }
      }),
    )
  }

  private getLocation(): string {
    return vscode.workspace.getConfiguration("ohMyCommit").get("ui.viewLocation") || "activitybar"
  }

  /**
   * 获取当前活跃的 webview
   */
  private getActiveWebview(): vscode.Webview | undefined {
    return this.webviewPanel?.webview || this.webviewView?.webview
  }

  public async postMessage(message: ServerMessageEvent) {
    const webview = this.getActiveWebview()
    if (webview) {
      this.logger.debug("Posting message to webview:", message)
      try {
        await webview.postMessage(message)
        this.logger.debug("Message posted successfully")
      } catch (error) {
        this.logger.error("Error posting message:", error)
      }
    } else {
      // 如果没有活跃的 webview，创建一个
      this.logger.info("No active webview, creating one...")
      await this.createWebviewPanel()

      // 重试发送消息
      const retryWebview = this.getActiveWebview()
      if (retryWebview) {
        try {
          await retryWebview.postMessage(message)
          this.logger.debug("Message posted successfully after retry")
        } catch (error) {
          this.logger.error("Error posting message after retry:", error)
        }
      } else {
        this.logger.error("Cannot post message: no webview available after retry")
      }
    }
  }

  public async createWebviewPanel(): Promise<vscode.WebviewPanel | undefined> {
    const location = this.getLocation()

    // 如果已经有活跃的 webview，直接使用
    if (this.webviewPanel || this.webviewView) {
      if (this.webviewPanel) {
        this.webviewPanel.reveal()
      } else if (this.webviewView) {
        this.webviewView.show(true)
      }
      return this.webviewPanel
    }

    // 如果是活动栏视图，使用 registerWebviewViewProvider
    if (location === "activitybar") {
      await vscode.commands.executeCommand("workbench.view.extension.ohMyCommit")
      return undefined
    }

    // 创建编辑器面板
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
        if (this.webviewPanel === panel) {
          this.webviewPanel = undefined
        }
      })

      this.webviewPanel = panel
      return panel
    } catch (error) {
      this.logger.error("Error initializing webview panel:", error)
      panel.dispose()
      throw error
    }
  }

  private getViewOptions(): { viewColumn: vscode.ViewColumn } {
    const location = this.getLocation()

    switch (location) {
      case "beside":
        return { viewColumn: vscode.ViewColumn.Beside }
      default:
        return { viewColumn: vscode.ViewColumn.Active }
    }
  }

  setMessageHandler(handler: (message: ClientMessageEvent) => Promise<void>) {
    this.messageHandler = handler
  }

  public get uiMode(): string {
    return this.config.get<string>("ohMyCommit.ui.mode")!
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
  }

  dispose() {
    this.cleanup()
  }
}
