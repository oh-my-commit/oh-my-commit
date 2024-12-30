/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { COMMAND_QUICK_COMMIT } from "@shared/common"

import type { IOrchestrator } from "@/orchestrator"
import type { BaseCommand } from "@/vscode-command"
import { TOKENS } from "@/vscode-token"

@Service()
export class QuickCommitCommand implements BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"

  constructor(
    @Inject(TOKENS.Context) private readonly context: vscode.ExtensionContext,
    @Inject(TOKENS.CommitOrchestrator)
    private readonly commitOrchestrator: IOrchestrator
  ) {
    //
    // // 设置 webview 的消息处理
    // this.webviewManager.setMessageHandler(Container.get(WebviewMessageHandler))

    // Clean up file watcher when extension is deactivated
    this.context.subscriptions.push(this)
  }

  public dispose(): void {
    // this.webviewManager?.dispose()
  }

  async execute(): Promise<void> {
    await this.commitOrchestrator.diffAndCommit()
  }
}
