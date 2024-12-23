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

const DEFAULT_LOG_LEVEL: LogLevel = "info"

export const normalizeLogLevel = (s?: string): LogLevel => {
  if (s) {
    const level = s.toLowerCase()
    if (Object.keys(LOG_LEVEL_PRIORITY).includes(level)) return level as LogLevel
  }
  return DEFAULT_LOG_LEVEL
}

function getCallerInfo(): string {
  const error = new Error()
  const stackLines = error.stack?.split("\n") || []

  // Find the actual caller by skipping internal methods
  let callerLine = ""
  for (let i = 3; i < stackLines.length; i++) {
    const line = stackLines[i]
    if (!line.includes("_log") && !line.includes("getCallerInfo")) {
      callerLine = line
      break
    }
  }

  if (!callerLine) return "unknown"

  // Try to match the file path and line number
  const fileMatch = callerLine.match(/\((.*?):(\d+):(\d+)\)/)
  if (!fileMatch) return "unknown"

  const filePath = fileMatch[1]
  // Get the relative path from the last 'src' directory
  const srcIndex = filePath.lastIndexOf("/src/")
  const relativePath = (
    srcIndex !== -1
      ? filePath.substring(srcIndex + 5) // +5 to skip "/src/"
      : filePath.split("/").pop() || "unknown"
  ).replace(".js", ".ts") // Convert JS extension to TS

  const lineNumber = fileMatch[2]

  // Try to get the method name
  const methodMatch = callerLine.match(/at\s+([\w.]+)\s+\(/)
  const methodName = methodMatch ? methodMatch[1].split(".").pop() : "unknown"

  return `${relativePath}:${methodName}:${lineNumber}`
}

@Service()
export abstract class BaseLogger implements ILogger {
  protected minLevel: LogLevel = DEFAULT_LOG_LEVEL

  constructor(protected name?: string) {
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

  trace(message: string, ...args: any[]): void {
    this._log("trace", message, ...args)
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
    const timestamp = `${new Date().toISOString()}`
    const levelStr = `${level.toUpperCase().padEnd(5)}`
    const loggerName = this.name || "unknown"
    const formattedMsg = formatMessage(message, args)
    const caller = getCallerInfo()

    console.log(
      chalk.green(`${timestamp} ${levelStr}`) +
        ` | [${loggerName}] ` +
        chalk.blue(`[${caller}] `) +
        formattedMsg,
    )
  }
}
