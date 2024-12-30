/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
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
import { VscodeGit } from "./vscode-git.js"
import { TOKENS } from "./vscode-token"

@Service()
export class VscodeWebview implements vscode.WebviewViewProvider {
  private webview?: vscode.Webview
  private messageHandler?: (message: ClientMessageEvent) => Promise<void>
  private readonly title: string = `Commit Assistant`
  private readonly webviewPath: string
  private view?: vscode.WebviewView

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
    @Inject(TOKENS.Config) private readonly config: VscodeConfig,
    @Inject(TOKENS.Context) private readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.GitManager) private readonly gitService: VscodeGit
  ) {
    this.webviewPath = path.join(this.context.extensionPath, "dist", "webview")

    // Register the webview provider with options to keep it alive
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

    this.logger.info(">> Webview provider registered")
  }

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.logger.info(">> Resolving webview view")
    this.view = webviewView
    this.webview = webviewView.webview

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.webviewPath)],
    }

    const workspaceFolders = vscode.workspace.workspaceFolders
    const workspaceRoot = workspaceFolders
      ? workspaceFolders[0]?.uri.fsPath
      : undefined
    const isWorkspaceValid = !!(
      workspaceRoot && vscode.workspace.fs.stat(vscode.Uri.file(workspaceRoot))
    )

    void this.postMessage({
      type: "workspace-status",
      data: {
        workspaceRoot,
        isWorkspaceValid,
        isGitRepository: await this.gitService.isGitRepository(),
        error: !workspaceRoot
          ? "请打开一个工作区文件夹"
          : !isWorkspaceValid
            ? "工作区文件夹不存在或已被删除"
            : undefined,
      },
    })

    webviewView.webview.html = this.getWebviewContent()

    if (this.messageHandler) {
      webviewView.webview.onDidReceiveMessage(async (message: any) => {
        this.logger.info("[Host << Webview] ", message)
        if (this.messageHandler) {
          await this.messageHandler(message)
        }
      })
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
    this.logger.info("[Host >> Webview]", message)
    await this.webview?.postMessage(message)
  }

  private getWebviewContent(): string {
    const isDev = process.env["NODE_ENV"] === "development"
    const devServerHost = "http://localhost:18080"

    if (isDev) {
      const nonce = require("crypto").randomBytes(16).toString("base64")

      const csp = [
        `form-action 'none'`,
        `default-src ${this.webview?.cspSource} ${devServerHost}`,
        `style-src ${this.webview?.cspSource} ${devServerHost} 'unsafe-inline'`,
        `script-src ${devServerHost} 'unsafe-eval' 'nonce-${nonce}'`,
        `connect-src ${devServerHost} ws://localhost:18080/ws`,
      ].join("; ")

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
      return htmlContent
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

  public async show(preserveFocus = true) {
    this.logger.info("Showing webview panel", { view: this.view })
    await vscode.commands.executeCommand("ohMyCommit.view.focus")
    if (this.view) {
      this.view.show(preserveFocus)
    } else {
      this.logger.warn("Webview not yet initialized")
    }
  }
}
