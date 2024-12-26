/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from "react"

import { clientPush } from "@/clientPush"
import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/progress/Progress"
import { useBasicMessage } from "@/hooks/use-basic-message"
import { useCloseWindow } from "@/hooks/use-close-window"
import { useCommitMessage } from "@/hooks/use-commit-message"

export const CommitPage = () => {
  useBasicMessage()
  useCommitMessage()
  useCloseWindow()

  useEffect(() => {
    clientPush({ type: "init", channel: "CommitPage" })
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Progress />
      <div className="flex-1 overflow-hidden">
        <CommitMessage />
        <div className="overflow-auto">
          <FileChanges />
        </div>
      </div>
      <Footer />
    </div>
  )
}
