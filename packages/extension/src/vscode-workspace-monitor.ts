/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import type { IOrchestrator } from "@/orchestrator"
import { TOKENS } from "@/vscode-token"

export interface IVscodeWorkspaceMonitor {
  onWorkspaceChange(): void
}

@Service()
export class VscodeWorkspaceMonitor {
  constructor(
    @Inject(TOKENS.CommitOrchestrator)
    private readonly commitOrchestrator: IOrchestrator
  ) {
    this.commitOrchestrator.context.subscriptions.push(
      /// Subscribe to workspace settings change
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("ohMyCommit.git.commitLanguage")) {
          const config = vscode.workspace.getConfiguration("ohMyCommit")
          const value = config.get("git.commitLanguage")
          void this.commitOrchestrator.postMessage({
            type: "settings-updated",
            data: {
              section: "git.commitLanguage",
              value,
            },
          })
        }
      }),

      /// Subscribe to git changes
      this.commitOrchestrator.gitService.onGitStatusChanged(async () => {
        this.commitOrchestrator.logger.info(
          "[QuickCommit] Git status changed, syncing files and commits..."
        )
        await this.commitOrchestrator.syncFiles()
      })
    )
  }
}
