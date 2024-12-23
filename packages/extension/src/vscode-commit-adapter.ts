import {
  APP_NAME,
  BaseLogger,
  formatMessage,
  normalizeLogLevel,
  type IConfig,
  type LogLevel,
} from "@shared/common"
import { Service } from "typedi"
import vscode from "vscode"

@Service()
export class VscodeConfig implements IConfig {
  private config = vscode.workspace.getConfiguration()

  get<T>(key: string): T | undefined {
    return this.config.get<T>(key)
  }

  async update(key: string, value: any, global?: boolean): Promise<void> {
    await this.config.update(key, value, global)
  }
}

@Service()
export class VscodeLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor(name = "host") {
    super(name)
    this.minLevel = normalizeLogLevel(process.env.LOG_LEVEL)
  }

  protected log(level: LogLevel, ...args: any[]) {
    // todo: better handle with formatMessage
    const rawMessage = formatMessage("", ...args)
    const prefix = `omc.${this.name}`
    this.logger[level]?.(`${prefix} ${rawMessage}`)
  }
}
