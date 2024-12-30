/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import type { ILogger } from "@shared/common"

import type { IVscodeGit } from "@/vscode-git"
import { TOKENS } from "@/vscode-tokens"

export interface IWorkspaceSettings extends vscode.Disposable {
  onSettingChange(callback: (section: string, value: any) => void): void
}

@Service()
export class VscodeSettings implements IWorkspaceSettings {
  private disposables: vscode.Disposable[] = []
  private configChangeHandlers: ((section: string, value: any) => void)[] = []

  constructor(
    @Inject(TOKENS.Logger) private readonly logger: ILogger,
    @Inject(TOKENS.GitManager) private readonly gitService: IVscodeGit
  ) {
    // 监听配置变化
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("ohMyCommit.git.commitLanguage")) {
          const config = vscode.workspace.getConfiguration("ohMyCommit")
          const value = config.get("git.commitLanguage")
          this.configChangeHandlers.forEach((handler) =>
            handler("git.commitLanguage", value)
          )
        }
      })
    )
  }

  onSettingChange(callback: (section: string, value: any) => void): void {
    this.configChangeHandlers.push(callback)
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose())
    this.configChangeHandlers = []
  }
}
