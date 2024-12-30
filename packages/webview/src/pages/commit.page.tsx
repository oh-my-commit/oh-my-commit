/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect, useState } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { CommitMessage } from "@/components/commit/CommitMessage"
import { FileChanges } from "@/components/commit/file-changes/FileChanges"
import { Footer } from "@/components/footer"
import { Progress } from "@/components/progress/Progress"
import { useBasicMessage } from "@/hooks/use-basic-message"
import { useCloseWindow } from "@/hooks/use-close-window"
import { useCommitMessage } from "@/hooks/use-commit-message"
import { logger } from "@/lib/vscode-client-logger"
import { workspaceStatusAtom } from "@/state/atoms/workspace"
import { clientPush } from "@/utils/clientPush"

import { ErrorLayout } from "./ErrorLayout"

export const CommitPage = () => {
  useBasicMessage()

  useCommitMessage()

  useCloseWindow()

  const [workspaceStatus] = useAtom(workspaceStatusAtom)
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

  // Render different states
  const renderContent = () => {
    logger.info("workspaceStatus:", workspaceStatus)

    if (!workspaceStatus?.isWorkspaceValid) {
      return (
        <ErrorLayout>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">工作区不可用</h2>
            <p className="mb-4 text-gray-500">
              {workspaceStatus?.error || "请打开一个有效的工作区以使用完整功能"}
            </p>
            <div className="flex flex-col gap-2">
              <VSCodeButton
                appearance="primary"
                onClick={() => {
                  clientPush("vscode.openFolder")
                }}
              >
                打开文件夹
              </VSCodeButton>
              <VSCodeButton
                onClick={() => {
                  clientPush("workbench.action.addRootFolder")
                }}
              >
                添加文件夹到工作区
              </VSCodeButton>
              <VSCodeButton
                onClick={() => {
                  clientPush("workbench.action.files.openFileFolder")
                }}
              >
                打开新窗口
              </VSCodeButton>
            </div>
          </div>
        </ErrorLayout>
      )
    }

    if (!workspaceStatus?.isGitRepository) {
      return (
        <ErrorLayout>
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
          </div>
        </ErrorLayout>
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
