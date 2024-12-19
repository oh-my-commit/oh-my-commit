import { LogLevel } from "../../utils/logger.js"

export type BaseClientMessageEvent =
  | {
      type: "ping"
    }
  | {
      type: "log"
      data: {
        channel?: string
        level: LogLevel
        rawMessage: any
      }
    }
  | {
      type: "close-window" // todo: or window-close ?
    }
  | {
      type: "open-external"
      data: {
        url: string
      }
    }
export type BaseServerMessageEvent = { type: "pong" }
