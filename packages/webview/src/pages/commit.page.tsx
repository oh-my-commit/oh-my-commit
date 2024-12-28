/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect, useState } from "react"

import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/progress/Progress"
import { useBasicMessage } from "@/hooks/use-basic-message"
import { useCloseWindow } from "@/hooks/use-close-window"
import { useCommitMessage } from "@/hooks/use-commit-message"
import { gitStatusAtom } from "@/state/atoms/git"
import { clientPush } from "@/utils/clientPush"

export const CommitPage = () => {
  useBasicMessage()

  useCommitMessage()

  useCloseWindow()

  const [gitStatus] = useAtom(gitStatusAtom)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    clientPush({ type: "init", channel: "CommitPage" })
  }, [])

  const handleInitGit = () => {
    setIsInitializing(true)
    clientPush({
      type: "execute-command",
      command: "git.init",
    })
    // Reset initializing state after a delay
    setTimeout(() => {
      setIsInitializing(false)
    }, 1000)
  }

  const handleRefresh = () => {
    clientPush({
      type: "init",
      channel: "CommitPage",
    })
  }

  // Render different states
  const renderContent = () => {
    if (!gitStatus?.isGitRepository) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-2">
          <div className="codicon codicon-source-control !text-[48px] text-[var(--vscode-foreground)] opacity-40" />
          <VSCodeDivider />
          <div className="my-4">
            <h2 className="text-[var(--vscode-foreground)] font-normal text-base mb-2">
              Git Not Initialized
            </h2>
            <p className="text-[var(--vscode-descriptionForeground)] text-sm max-w-md">
              This workspace is not yet a Git repository.
              <br />
              Initialize Git to start tracking your changes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <VSCodeButton onClick={handleInitGit} disabled={isInitializing}>
              {isInitializing ? (
                <span className="flex items-center gap-2">
                  <span className="codicon codicon-loading codicon-modifier-spin" />
                  Initializing...
                </span>
              ) : (
                "Initialize Repository"
              )}
            </VSCodeButton>
            <VSCodeButton
              appearance="secondary"
              onClick={handleRefresh}
              disabled={isInitializing}
            >
              Refresh
            </VSCodeButton>
          </div>
        </div>
      )
    }

    return (
      <>
        <CommitMessage />
        <FileChanges />
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Progress />
      <div className="flex-1 flex flex-col">{renderContent()}</div>
      <Footer />
    </div>
  )
}
