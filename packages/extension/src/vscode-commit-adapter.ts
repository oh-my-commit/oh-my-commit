/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Service } from "typedi"
import vscode from "vscode"

import {
  APP_NAME,
  BaseLogger,
  type IConfig,
  type LogLevel,
  formatMessage,
  normalizeLogLevel,
} from "@shared/common"

@Service()
export class VscodeConfig implements IConfig {
  get<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration().get<T>(key)
  }

  async update(key: string, value: unknown, global?: boolean): Promise<void> {
    await vscode.workspace.getConfiguration().update(key, value, global)
  }
}

@Service()
export class VscodeLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor(name = "host") {
    super(name)
    this.minLevel = normalizeLogLevel(process.env["LOG_LEVEL"])
  }

  protected log(level: LogLevel, ...args: unknown[]) {
    // todo: better handle with formatMessage
    const rawMessage = formatMessage(...args)
    const prefix = `omc.${this.name}`
    this.logger[level]?.(`${prefix} ${rawMessage}`)
  }
}
