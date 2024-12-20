import { APP_NAME, BaseLogger, formatMessage, type LogLevel } from "@shared"
import vscode from "vscode"

export class VscodeExtensionLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor(channel: string) {
    super(channel) // 确保调用父类构造函数
  }

  protected log(level: LogLevel, ...args: any[]) {
    const rawMessage = formatMessage(...args)
    const prefix = `omc.${this.channel}`
    
    switch (level) {
      case "info":
        this.logger.info(`${prefix} ${rawMessage}`)
        break
      case "error":
        this.logger.error(`${prefix} ${rawMessage}`)
        break
      case "warn":
        this.logger.warn(`${prefix} ${rawMessage}`)
        break
      case "debug":
        this.logger.debug(`${prefix} ${rawMessage}`)
        break
      case "trace":
        this.logger.trace(`${prefix} ${rawMessage}`)
        break
    }
  }
}
