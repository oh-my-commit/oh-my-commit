import { vscodeClientLogger } from "@/lib/vscode-client-logger"
import type { ServerMessageEvent } from "@shared/common"
import { useEffect } from "react"

type MessageHandler = (message: ServerMessageEvent) => void

export const useMessage = (handler: MessageHandler) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as ServerMessageEvent

      if (!message || typeof message !== "object" || !("type" in message)) {
        vscodeClientLogger.info("Unknown event:", message)
        return
      }

      handler(message)
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [handler])
}
