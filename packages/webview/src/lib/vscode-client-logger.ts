/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BaseLogger, type LogLevel, formatMessage } from "@shared/common"

import { clientPush } from "@/clientPush"

export class VscodeClientLogger extends BaseLogger {
  constructor(name: string) {
    super(name)
  }

  protected log(level: LogLevel, ...args: any[]) {
    const message = formatMessage(...args)

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
