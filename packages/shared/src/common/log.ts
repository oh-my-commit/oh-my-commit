/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Service } from "typedi"

import type { ILogger } from "./core"
import { formatMessage } from "./utils"

export type LogLevel = "debug" | "trace" | "info" | "warn" | "error"

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  trace: 20,
  info: 30,
  warn: 40,
  error: 50,
}

const DEFAULT_LOG_LEVEL: LogLevel = "debug"

export const normalizeLogLevel = (s?: string): LogLevel => {
  if (s) {
    const level = s.toLowerCase()
    if (Object.keys(LOG_LEVEL_PRIORITY).includes(level)) return level as LogLevel
  }
  return DEFAULT_LOG_LEVEL
}

@Service()
export abstract class BaseLogger implements ILogger {
  protected minLevel: LogLevel = DEFAULT_LOG_LEVEL
  protected name?: string

  constructor(name?: string) {
    this.name = name
  }

  setName(name: string): void {
    this.name = name
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  info(...args: unknown[]): void {
    this._log("info", ...args)
  }

  error(...args: unknown[]): void {
    this._log("error", ...args)
  }

  warn(...args: unknown[]): void {
    this._log("warn", ...args)
  }

  debug(...args: unknown[]): void {
    this._log("debug", ...args)
  }

  trace(...args: unknown[]): void {
    this._log("trace", ...args)
  }

  protected shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  protected _log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return
    this.log(level, ...args)
  }

  protected abstract log(level: LogLevel, ...args: unknown[]): void
}

@Service()
export class ConsoleLogger extends BaseLogger implements ILogger {
  protected override name = "console"

  protected log(level: LogLevel, ...args: unknown[]): void {
    const timestamp = `${new Date().toISOString()}`
    const levelStr = `${level.toUpperCase().padEnd(5)}`
    const loggerName = this.name || "unknown"
    const formattedMsg = formatMessage(...args)

    console.log(`${timestamp} ${levelStr}` + ` | [${loggerName}] ` + formattedMsg)
  }
}
