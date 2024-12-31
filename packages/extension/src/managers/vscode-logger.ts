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

@Service()
export class VscodeLogger extends BaseLogger implements ILogger {
  override name = "host"

  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  protected log(level: LogLevel, ...args: unknown[]) {
    // todo: better handle with formatMessage
    const rawMessage = formatMessage(...args)
    const prefix = `omc.${this.name}`
    this.logger[level]?.(`${prefix} ${rawMessage}`)
  }
}
