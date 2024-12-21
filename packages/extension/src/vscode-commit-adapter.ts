import {
  APP_NAME,
  BaseLogger,
  CommitManager,
  formatMessage,
  type IConfig,
  type LogLevel,
} from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import vscode from "vscode"

export class VscodeConfig implements IConfig {
  private config = vscode.workspace.getConfiguration()

  get<T>(key: string): T | undefined {
    return this.config.get<T>(key)
  }

  async update(key: string, value: any, global?: boolean): Promise<void> {
    await this.config.update(key, value, global)
  }
}

export class VscodeLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  constructor(channel = "host") {
    super(channel) // 确保调用父类构造函数
  }

  protected log(level: LogLevel, ...args: any[]) {
    const rawMessage = formatMessage(...args)
    const prefix = `omc.${this.channel}`
    this.logger[level]?.(`${prefix} ${rawMessage}`)
  }
}

export const vscodeCommitManager = CommitManager.create({
  createLogger: () => new VscodeLogger(),
  createProvidersManager: () => new ProviderRegistry(),
  createConfig: () => new VscodeConfig(),
})
