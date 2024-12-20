import { APP_NAME, BaseLogger, formatMessage, IConfig, IUIProvider, type LogLevel } from "@shared"
import * as vscode from "vscode"

export class VscodeConfig implements IConfig {
  private config = vscode.workspace.getConfiguration()

  get<T>(key: string): T | undefined {
    return this.config.get<T>(key)
  }

  async update(key: string, value: any, global?: boolean): Promise<void> {
    await this.config.update(key, value, global)
  }
}

export class VscodeUIProvider implements IUIProvider {
  async showError(message: string, ...actions: string[]): Promise<string | undefined> {
    return vscode.window.showErrorMessage(message, ...actions)
  }

  async showInfo(message: string) {
    return vscode.window.showInformationMessage(message)
  }
}

export class VscodeExtensionLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor(channel = "host") {
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
