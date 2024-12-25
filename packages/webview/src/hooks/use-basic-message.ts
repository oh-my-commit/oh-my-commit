import type { ServerMessageEvent } from "@shared/common"
import { useMessage } from "./use-message"

export const useBasicMessage = () => {
  useMessage((message: ServerMessageEvent) => {
    switch (message.type) {
      case "pong":
        // 处理 pong 消息
        break
      case "webpackProgress":
        // 处理 webpack 进度消息
        break
    }
  })
}
