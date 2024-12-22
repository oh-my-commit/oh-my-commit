import { clientPush } from "@/clientPush"
import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { useCloseWindow } from "@/hooks/use-close-window"
import { vscodeClientLogger } from "@/lib/vscode-client-logger"
import { diffResultAtom } from "@/state/atoms/commit.changed-files"
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message"
import type { ServerMessageEvent } from "@shared/common"

import { useSetAtom } from "jotai"
import { useEffect } from "react"

export const CommitPage = () => {
  const setTitle = useSetAtom(commitTitleAtom)
  const setBody = useSetAtom(commitBodyAtom)
  const setDiffResult = useSetAtom(diffResultAtom)

  useCloseWindow()

  useEffect(() => {
    clientPush({ type: "init", channel: "CommitPage" })
  }, [])

  useEffect(() => {
    vscodeClientLogger.info("[useEffect] Setting up message event listener")

    const handleMessage = (event: MessageEvent) => {
      const message = event.data as ServerMessageEvent

      if (!message || !("type" in message)) {
        vscodeClientLogger.info("Unknown event:", message)
        return
      }

      switch (message.type) {
        case "diff-result":
          setDiffResult(message.data)
          break
        case "commit-message":
          if (message.data.ok) {
            setTitle(message.data.data.title)
            setBody(message.data.data.body ?? "")
          }
          break
        case "commit-result":
          break
        case "pong":
          break
        default:
          vscodeClientLogger.info("Unknown event:", message)
          return
      }
    }

    window.addEventListener("message", handleMessage)

    // 清理函数
    return () => {
      vscodeClientLogger.info("[useEffect] Removing message event listener")
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  vscodeClientLogger.info("== rendered ==")

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <CommitMessage />
        <FileChanges />
      </div>
      <Footer />
    </div>
  )
}
