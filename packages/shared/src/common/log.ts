import { Service } from "typedi"
import type { ILogger } from "./core"
import { formatMessage } from "./utils"

export type LogLevel = "debug" | "info" | "warn" | "error" | "trace"

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  trace: 20,
  info: 30,
  warn: 40,
  error: 50,
}

const DEFAULT_LOG_LEVEL: LogLevel = "info"

function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase()
  return envLevel && envLevel in LOG_LEVEL_PRIORITY ? (envLevel as LogLevel) : DEFAULT_LOG_LEVEL
}

@Service()
export abstract class BaseLogger implements ILogger {
  protected minLevel: LogLevel

  constructor(protected readonly name?: string) {
    this.minLevel = getLogLevelFromEnv()
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  protected shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  info(message: string, ...args: any[]): void {
    this._log("info", message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this._log("error", message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this._log("warn", message, ...args)
  }

  debug(message: string, ...args: any[]): void {
    this._log("debug", message, ...args)
  }

  protected _log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return
    this.log(level, message, ...args)
  }

  protected abstract log(level: LogLevel, message: string, ...args: any[]): void
}

@Service()
export class ConsoleLogger extends BaseLogger implements ILogger {
  protected name = "console"

  protected log(level: LogLevel, message: string, ...args: any[]) {
    console.log(
      `${new Date().toISOString()} ${level.toUpperCase()} | [${
        this.name || "unknown"
      }] ${formatMessage(message, args)}`,
    )
  }
}
