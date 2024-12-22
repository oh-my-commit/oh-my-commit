import "reflect-metadata"

import Container from "typedi"
import * as vscode from "vscode"
import { VSCODE_TOKENS } from "./vscode-token"

console.log({ aaa: "123       " })

export async function activate(context: vscode.ExtensionContext) {
  try {
    Container.set(VSCODE_TOKENS.Context, context)

    // const gitService = new VscodeGit()

    // Container.set(VSCODE_TOKENS.GitService, gitService)

    // // 1. 注册 config
    // Container.set(TOKENS.Config, Container.get(VscodeConfig))

    // // 2. 注册 logger 服务
    // Container.set(TOKENS.Logger, Container.get(VscodeLogger))

    // // 3. 注册 statusbar
    // Container.set(VSCODE_TOKENS.StatusbarService, Container.get(StatusBarManager))

    // // 3. 注册 provider registry (depends logger)
    // Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))

    // // 4. 获取 CommitManager 实例
    // Container.set(TOKENS.CommitManager, Container.get(CommitManager))

    // await app.initialize();
    context.subscriptions.push({ dispose: () => {} })
    console.log("Extension activated 5 ")
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    void vscode.window.showErrorMessage(`Failed to initialize Oh My Commit: ${message}`)
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
