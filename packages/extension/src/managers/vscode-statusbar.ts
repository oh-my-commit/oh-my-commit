/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { APP_NAME, COMMAND_QUICK_COMMIT, type ILogger } from "@shared/common"

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
  private waitingStack: Array<{
    message: string
    previousState: {
      text: string
      tooltip?: string
      command?: string
    }
  }> = []

  constructor(@Inject(TOKENS.Logger) private readonly logger: ILogger) {
    super()
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
    this.statusBarItem.name = APP_NAME
    this.statusBarItem.command = COMMAND_QUICK_COMMIT

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
    const previousState = {
      text: this.statusBarItem.text,
      tooltip: this.statusBarItem.tooltip,
      command: this.statusBarItem.command,
    }

    this.waitingStack.push({ message, previousState })

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
    this.logger.info("Clearing waiting status...", this.waitingStack)
    if (this.waitingStack.length > 0) {
      const poppedState = this.waitingStack.pop()

      if (this.waitingStack.length > 0) {
        // If there are more waiting states, show the next one
        const currentState = this.waitingStack[this.waitingStack.length - 1]
        this.emit("status.update", {
          type: "status.update",
          data: {
            text: `$(sync~spin) ${currentState?.message}`,
            tooltip: undefined,
            command: undefined,
          },
        })
      } else {
        // If no more waiting states, restore the previous state
        this.emit("status.update", {
          type: "status.update",
          data: poppedState!.previousState,
        })
      }
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
      },
    })
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }
}
