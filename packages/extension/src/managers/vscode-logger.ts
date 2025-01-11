/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Service } from "typedi"
import vscode from "vscode"

import { APP_NAME, BaseLogger, type ILogger, type LogLevel, formatMessage } from "@shared/common"

const vscodeLogLevelMap: Record<vscode.LogLevel, LogLevel> = {
  [vscode.LogLevel.Off]: "off",
  [vscode.LogLevel.Trace]: "trace",
  [vscode.LogLevel.Debug]: "debug",
  [vscode.LogLevel.Info]: "info",
  [vscode.LogLevel.Warning]: "warn",
  [vscode.LogLevel.Error]: "error",
}

@Service()
export class VscodeLogger extends BaseLogger implements ILogger {
  override name = "host"

  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor() {
    super()
    this.logger.onDidChangeLogLevel((e: vscode.LogLevel) => {
      this.setLevel(vscodeLogLevelMap[e])
    })
    this.logger.show()
  }

  protected log(level: LogLevel, ...args: unknown[]) {
    // todo: better handle with formatMessage
    const rawMessage = formatMessage(...args)
    const prefix = `omc.${this.name}`
    if (level === "off") {
      return
    }
    this.logger[level](`${prefix} ${rawMessage}`)
  }
}
