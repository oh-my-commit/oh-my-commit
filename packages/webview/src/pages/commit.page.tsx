import { clientPush } from "@/clientPush"
import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { useBasicMessage } from "@/hooks/use-basic-message"
import { useCloseWindow } from "@/hooks/use-close-window"
import { useCommitMessage } from "@/hooks/use-commit-message"
import { useEffect } from "react"

export const CommitPage = () => {
  useBasicMessage()
  useCommitMessage()
  useCloseWindow()

  useEffect(() => {
    clientPush({ type: "init", channel: "CommitPage" })
  }, [])

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
