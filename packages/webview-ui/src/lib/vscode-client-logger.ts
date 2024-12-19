import { clientPush } from "@/clientPush"
import { BaseLogger, formatMessage, LogLevel } from "@shared/common"

export class VscodeClientLogger extends BaseLogger {
  protected log(level: LogLevel, ...args: any[]) {
    const rawMessage = formatMessage(...args)

    clientPush({
      channel: this.channel,
      type: "log",
      data: {
        level,
        rawMessage,
      },
    })
  }
}

export const vscodeClientLogger = new VscodeClientLogger("Webview Default")
