import { APP_NAME, BaseLogger, formatMessage, LogLevel } from "@shared"
import vscode from "vscode"

export class VscodeExtensionLogger extends BaseLogger {
  private logger = vscode.window.createOutputChannel(APP_NAME, {
    log: true,
  })

  protected log(level: LogLevel, ...args: any[]) {
    const rawMessage = formatMessage(...args)
    this.logger[level](`omc.${this.channel}`, rawMessage)
  }
}
