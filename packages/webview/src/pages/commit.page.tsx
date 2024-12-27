/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from "react"

import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { clientPush } from "@/clientPush"
import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/progress/Progress"
import { useBasicMessage } from "@/hooks/use-basic-message"
import { useCloseWindow } from "@/hooks/use-close-window"
import { useCommitMessage } from "@/hooks/use-commit-message"
import { diffResultAtom } from "@/state/atoms/commit.changed-files"

export const CommitPage = () => {
  useBasicMessage()
  useCommitMessage()
  useCloseWindow()
  const [diffResult] = useAtom(diffResultAtom)

  useEffect(() => {
    clientPush({ type: "init", channel: "CommitPage" })
  }, [])

  const hasChanges = diffResult && diffResult.changed > 0

  const handleOpenSourceControl = () => {
    // Send a message to the extension to execute the command
    clientPush({
      type: "show-info",
      data: { message: "Opening Source Control view..." },
    })

    clientPush({
      type: "execute-command",
      command: "workbench.view.scm",
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Progress />
      <div className="flex-1 flex flex-col">
        {hasChanges ? (
          <>
            <CommitMessage />
            <FileChanges />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-2">
            <div className="codicon codicon-git-commit !text-[48px] text-[var(--vscode-foreground)] opacity-40" />
            <VSCodeDivider />
            <div className="my-4">
              <h2 className="text-[var(--vscode-foreground)] font-normal text-base mb-2">
                No Changes to Commit
              </h2>
              <p className="text-[var(--vscode-descriptionForeground)] text-sm max-w-md">
                Your working directory is clean.
                <br />
                Make some changes to your files and they'll appear here for
                commit.
              </p>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <VSCodeButton
                appearance="secondary"
                onClick={handleOpenSourceControl}
              >
                Open Source Control
              </VSCodeButton>
              <VSCodeButton
                onClick={() => {
                  clientPush({
                    type: "init",
                    channel: "CommitPage",
                  })
                }}
              >
                Refresh
              </VSCodeButton>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
