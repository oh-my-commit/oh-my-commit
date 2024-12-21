import { Service } from "typedi"
import type { ILogger } from "./core"
import { formatMessage } from "./utils"

export type LogLevel = "debug" | "info" | "warn" | "error" | "trace"

export abstract class BaseLogger implements ILogger {
  constructor(protected readonly name?: string) {}

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args)
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args)
  }

  protected abstract log(level: LogLevel, message: string, ...args: any[]): void
}

@Service()
export class ConsoleLogger extends BaseLogger implements ILogger {
  protected log(level: LogLevel, message: string, ...args: any[]) {
    console.log(
      `${new Date().toISOString()} ${level.toUpperCase()} | [${
        this.name || "unknown"
      }] ${formatMessage(message, args)}`,
    )
  }
}
