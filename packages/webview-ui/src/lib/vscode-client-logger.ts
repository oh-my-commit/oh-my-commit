import { clientPush } from "@/clientPush"
import { BaseLogger, formatMessage, type LogLevel } from "@shared/common"

export class VscodeClientLogger extends BaseLogger {
  constructor(name: string) {
    super(name)
  }

  protected log(level: LogLevel, ...args: any[]) {
    const message = formatMessage("", ...args)

    // 推送到 VSCode
    clientPush({
      channel: this.name,
      type: "log",
      data: {
        level,
        rawMessage: message,
      },
    })
  }
}

export const vscodeClientLogger = new VscodeClientLogger("Webview")
