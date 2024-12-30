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

import type { IVscodeGit } from "@/managers/vscode-git"
import { TOKENS } from "@/managers/vscode-tokens"

export interface IPreferenceMonitor extends vscode.Disposable {
  onPreferenceChange(callback: (section: string, value: any) => void): void
  onDisplayModeChange(callback: (mode: string) => void): void
}

@Service()
export class PreferenceMonitor implements IPreferenceMonitor {
  private disposables: vscode.Disposable[] = []
  private configChangeHandlers: ((section: string, value: any) => void)[] = []
  private displayModeHandlers: ((mode: string) => void)[] = []

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
          this.configChangeHandlers.forEach((handler) => handler("git.commitLanguage", value))
        }

        if (e.affectsConfiguration("ohMyCommit.ui.mode")) {
          const config = vscode.workspace.getConfiguration("ohMyCommit")
          const mode = config.get<string>("ui.mode", "panel")
          this.displayModeHandlers.forEach((handler) => handler(mode))

          void vscode.window.showInformationMessage(`Oh My Commit 已切换到 ${mode === "panel" ? "面板" : "通知"} 模式`)

          // 当模式为 panel 时自动打开面板
          if (mode === "panel") {
            void vscode.commands.executeCommand("ohMyCommit.view.focus")
          }
        }
      })
    )
  }

  onPreferenceChange(callback: (section: string, value: any) => void): void {
    this.configChangeHandlers.push(callback)
  }

  onDisplayModeChange(callback: (mode: string) => void): void {
    this.displayModeHandlers.push(callback)
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose())
    this.configChangeHandlers = []
    this.displayModeHandlers = []
  }
}
