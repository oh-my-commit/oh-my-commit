import chalk from "chalk"
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

  protected shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  info(...args: any[]): void {
    this._log("info", ...args)
  }

  error(...args: any[]): void {
    this._log("error", ...args)
  }

  warn(...args: any[]): void {
    this._log("warn", ...args)
  }

  debug(...args: any[]): void {
    this._log("debug", ...args)
  }

  trace(...args: any[]): void {
    this._log("trace", ...args)
  }

  protected _log(level: LogLevel, ...args: any[]): void {
    if (!this.shouldLog(level)) return
    this.log(level, ...args)
  }

  protected abstract log(level: LogLevel, ...args: any[]): void
}

@Service()
export class ConsoleLogger extends BaseLogger implements ILogger {
  protected override name = "console"

  protected log(level: LogLevel, ...args: any[]) {
    const timestamp = `${new Date().toISOString()}`
    const levelStr = `${level.toUpperCase().padEnd(5)}`
    const loggerName = this.name || "unknown"
    const formattedMsg = formatMessage(...args)

    console.log(chalk.green(`${timestamp} ${levelStr}`) + ` | [${loggerName}] ` + formattedMsg)
  }
}
