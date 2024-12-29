/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Handlebars from "handlebars"
import path from "path"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { ClientMessageEvent, ServerMessageEvent, outdent } from "@shared/common"

import { VscodeConfig, VscodeLogger } from "./vscode-commit-adapter"
import { TOKENS } from "./vscode-token"

@Service()
export class VscodeWebview
  implements vscode.WebviewViewProvider, vscode.Disposable
{
  private webview?: vscode.Webview
  private messageHandler?: (message: ClientMessageEvent) => Promise<void>
  private readonly title: string = `Commit Assistant`
  private readonly webviewPath: string

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(TOKENS.Context)
    private readonly context: vscode.ExtensionContext
  ) {
    console.log("-- init webview --")
    this.webviewPath = path.join(this.context.extensionPath, "dist", "webview")

    // 只注册 WebviewViewProvider
    const registration = vscode.window.registerWebviewViewProvider(
      "ohMyCommit.view",
      this,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )

    this.context.subscriptions.push(registration)
    console.log("-- webview initialized --")
  }

  // WebviewViewProvider 接口实现
  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    console.log("-- resolving webview view --")
    this.webview = webviewView.webview

    // 配置 webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.webviewPath)],
    }

    // 设置内容
    webviewView.webview.html = this.getWebviewContent()

    // 设置消息处理器
    if (this.messageHandler) {
      webviewView.webview.onDidReceiveMessage(this.messageHandler)
    }

    webviewView.title = this.title
  }

  public setMessageHandler(
    handler: (message: ClientMessageEvent) => Promise<void>
  ) {
    this.messageHandler = handler
    if (this.webview) {
      this.webview.onDidReceiveMessage(handler)
    }
  }

  public async postMessage(message: ServerMessageEvent) {
    if (this.webview) {
      try {
        await this.webview.postMessage(message)
      } catch (error) {
        this.logger.error("Error posting message:", error)
      }
    }
  }

  public async createWebviewPanel() {
    console.log("-- creating webview panel --")
    const panel = vscode.window.createWebviewPanel(
      "ohMyCommit.panel",
      this.title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(this.webviewPath)],
      }
    )

    this.webview = panel.webview
    panel.webview.html = this.getWebviewContent()

    if (this.messageHandler) {
      panel.webview.onDidReceiveMessage(this.messageHandler)
    }

    return panel
  }

  private getWebviewContent(): string {
    const isDev = process.env["NODE_ENV"] === "development"
    const devServerHost = "http://localhost:18080"
    console.log("-- init webview content -- ", { isDev })

    if (isDev) {
      console.log("-- generating dev template --")
      const nonce = require("crypto").randomBytes(16).toString("base64")
      console.log("-- generated nonce --", nonce)

      const csp = [
        `form-action 'none'`,
        `default-src ${this.webview?.cspSource} ${devServerHost}`,
        `style-src ${this.webview?.cspSource} ${devServerHost} 'unsafe-inline'`,
        `script-src ${devServerHost} 'unsafe-eval' 'nonce-${nonce}'`,
        `connect-src ${devServerHost} ws://localhost:18080/ws`,
      ].join("; ")
      console.log("-- generated csp --", csp)

      try {
        console.log("-- before outdent --")
        const htmlContent = outdent`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">

              <!-- no cache for development -->
              <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
              <meta http-equiv="Pragma" content="no-cache" />
              <meta http-equiv="Expires" content="0" />
              
              <meta http-equiv="Content-Security-Policy" content="${csp}">

              <title>${this.title}</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" nonce="${nonce}" src="${devServerHost}/main.js"></script>
            </body>
          </html>
          `
        console.log("-- after outdent --", htmlContent.slice(0, 100)) // 只显示前100个字符避免日志过长
        return htmlContent
      } catch (error) {
        console.error("-- outdent error --", error)
        throw error
      }
    }

    const template = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <meta http-equiv="Content-Security-Policy" content="{{{csp}}}" />

          <title>${this.title}</title>
          <script
            crossorigin
            src="https://unpkg.com/react@18/umd/react.development.js"
          ></script>
          <script
            crossorigin
            src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"
          ></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="{{{scriptUri}}}"></script>
        </body>
      </html>
    `
    const scriptPath = path.join(this.webviewPath, "main.js")
    const scriptUri = this.webview?.asWebviewUri(vscode.Uri.file(scriptPath))

    const compiled = Handlebars.compile(template)
    return compiled({
      scriptUri,
      cspSource: this.webview?.cspSource,
    })
  }

  dispose() {
    // Nothing to dispose
  }
}
