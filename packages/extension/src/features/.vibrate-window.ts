/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import vscode from "vscode"

import type { BaseLogger } from "@shared/common"

export class VibrateWindow {
  private persistWindowState: boolean = true
  private savedStates: Record<string, any> = {}

  private logger: BaseLogger

  constructor(
    logger: BaseLogger,
    private readonly uiMode: "window" | "panel"
  ) {
    this.logger = logger
  }

  // 窗口模式下的目标配置
  private readonly windowModeConfigs = {
    // 工作区级别配置
    workspace: {
      "workbench.editor.showTabs": "none" as const,
      "workbench.editor.editorActionsLocation": "hidden" as const,
      "workbench.activityBar.location": "hidden" as const,
      "workbench.auxiliaryActivityBar.location": "hidden" as const,
    },
    // 用户级别配置
    user: {
      "window.titleBarStyle": "native" as const,
      "window.customTitleBarVisibility": "never" as const,
    },
  }

  private getWorkspaceConfig(key: keyof typeof this.windowModeConfigs.workspace) {
    return this.windowModeConfigs.workspace[key]
  }

  private getUserConfig(key: keyof typeof this.windowModeConfigs.user) {
    return this.windowModeConfigs.user[key]
  }

  private async saveWindowState() {
    if (this.uiMode === "window" && this.persistWindowState) {
      this.logger.info("Saving window state")
      for (const key of Object.keys(this.windowModeConfigs.workspace)) {
        // 保存当前值
        this.savedStates[key] = vscode.workspace.getConfiguration().get(key)
        this.logger.trace(`Saved window state: ${key}=${this.savedStates[key]}`)
        // 设置目标值
        await this.updateWorkspaceConfig(
          key,
          this.getWorkspaceConfig(key as keyof typeof this.windowModeConfigs.workspace),
          vscode.ConfigurationTarget.Workspace
        )
      }

      // 保存和设置用户配置
      for (const key of Object.keys(this.windowModeConfigs.user)) {
        // 保存当前值
        this.savedStates[key] = vscode.workspace.getConfiguration().get(key)
        this.logger.trace(`Saved window state: ${key}=${this.savedStates[key]}`)
        // 设置目标值
        await this.updateWorkspaceConfig(
          key,
          this.getUserConfig(key as keyof typeof this.windowModeConfigs.user),
          vscode.ConfigurationTarget.Global
        )
      }

      this.logger.info("Window state saved")
    }
  }

  private async restoreWindowState() {
    if (
      this.uiMode === "window" &&
      this.persistWindowState &&
      Object.keys(this.savedStates).length > 0
    ) {
      for (const key of Object.keys(this.windowModeConfigs.workspace) as Array<
        keyof typeof this.windowModeConfigs.workspace
      >) {
        await vscode.workspace
          .getConfiguration()
          .update(key, this.getWorkspaceConfig(key), vscode.ConfigurationTarget.Workspace)
      }

      for (const key of Object.keys(this.windowModeConfigs.user) as Array<
        keyof typeof this.windowModeConfigs.user
      >) {
        await vscode.workspace
          .getConfiguration()
          .update(key, this.getUserConfig(key), vscode.ConfigurationTarget.Global)
      }

      // 清空保存的状态
      this.savedStates = {}
      this.logger.info("Window state restored")
    }
  }

  private async updateWorkspaceConfig(
    key: string,
    value: unknown,
    target: vscode.ConfigurationTarget
  ) {
    this.logger.debug(`Setting ${key} to ${value} (target: ${target})`)
    await vscode.workspace.getConfiguration().update(key, value, target)
  }
}
