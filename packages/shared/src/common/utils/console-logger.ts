import { formatMessage } from "./format-message"
import { BaseLogger, LogLevel } from "./logger"

export class ConsoleLogger extends BaseLogger {
  protected log(level: LogLevel, ...args: any[]) {
    console.log(
      `${new Date().toISOString()} ${level.toUpperCase()} | [${
        this.channel
      }] ${formatMessage(...args)}]`,
    )
  }
}
