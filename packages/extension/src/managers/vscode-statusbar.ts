/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { APP_NAME, COMMAND_SELECT_MODEL, type ILogger } from "@shared/common"

import { EventEmitter, IService, type ServiceEvent } from "@/interface/base-service"
import { TOKENS } from "@/managers/vscode-tokens"

export type StatusBarEvent = ServiceEvent<{
  text?: string
  tooltip?: string
  command?: string
}>

export interface IStatusBarManager extends IService {
  setWaiting(message?: string): void
  clearWaiting(): void
  setText(text: string): void
  setModel(model: { name: string }): void
}

@Service()
export class StatusBarManager extends EventEmitter<StatusBarEvent> implements IStatusBarManager {
  private statusBarItem: vscode.StatusBarItem
  private previousState?: {
    text: string
    tooltip?: string
    command?: string
  }

  constructor(@Inject(TOKENS.Logger) private readonly logger: ILogger) {
    super()
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
    this.statusBarItem.name = APP_NAME

    this.logger.info("Initializing StatusBar...")
    this.statusBarItem.text = `$(sync~spin) (Initializing...)`
    this.statusBarItem.show()

    // 监听状态变化事件
    this.on("status.update", (event) => {
      if (event.data.text) {
        this.statusBarItem.text = event.data.text
      }
      if (event.data.tooltip) {
        this.statusBarItem.tooltip = event.data.tooltip
      }
      if (event.data.command) {
        this.statusBarItem.command = event.data.command
      }
    })
  }

  setWaiting(message = "Working..."): void {
    this.previousState = {
      text: this.statusBarItem.text,
      tooltip: this.statusBarItem.tooltip,
      command: this.statusBarItem.command,
    }
    this.emit("status.update", {
      type: "status.update",
      data: {
        text: `$(sync~spin) ${message}`,
        tooltip: undefined,
        command: undefined,
      },
    })
  }

  clearWaiting(): void {
    this.logger.info("Clearing waiting status...", this.previousState)
    if (this.previousState) {
      this.emit("status.update", {
        type: "status.update",
        data: this.previousState,
      })
      this.previousState = undefined
    }
  }

  setText(text: string): void {
    this.emit("status.update", {
      type: "status.update",
      data: { text },
    })
  }

  setModel(model: { name: string }): void {
    this.emit("status.update", {
      type: "status.update",
      data: {
        text: `$(git-commit) ${model.name}`,
        tooltip: `${APP_NAME}\nCurrent Model: ${model.name}`,
        command: COMMAND_SELECT_MODEL,
      },
    })
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }
}
