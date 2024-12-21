import { Service } from "typedi"
import type { ILogger } from "./core"
import { formatMessage } from "./utils"

export type LogLevel = "debug" | "info" | "warn" | "error" | "trace"

export abstract class BaseLogger implements ILogger {
  protected channel = "default"

  setChannel(channel: string) {
    this.channel = channel
  }

  constructor(channel: string) {
    this.channel = channel
  }

  protected abstract log(level: LogLevel, ...args: any[]): void

  debug(...args: any[]) {
    this.log("debug", ...args)
  }

  info(...args: any[]) {
    this.log("info", ...args)
  }

  warn(...args: any[]) {
    this.log("warn", ...args)
  }

  error(...args: any[]) {
    this.log("error", ...args)
  }

  trace(...args: any[]) {
    this.log("trace", ...args)
  }
}

@Service()
export class ConsoleLogger extends BaseLogger implements ILogger {
  protected log(level: LogLevel, ...args: any[]) {
    console.log(
      `${new Date().toISOString()} ${level.toUpperCase()} | [${
        this.channel
      }] ${formatMessage(...args)}]`,
    )
  }
}
