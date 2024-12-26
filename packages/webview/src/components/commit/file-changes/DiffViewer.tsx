/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import cn from "classnames"
import { useAtom } from "jotai"
import { useCallback, useEffect, useMemo, useRef, type FC } from "react"
import { Diff, parseDiff } from "react-diff-view"
import "react-diff-view/style/index.css"
import "./DiffViewer.css"

import {
  diffDetailAtom,
  diffResultAtom,
  lastOpenedFilePathAtom,
} from "@/state/atoms/commit.changed-files"
import { searchQueryAtom } from "@/state/atoms/search"
import { diffWrapLineAtom } from "@/state/atoms/ui"

export const DiffViewer: FC = () => {
  const [wrapLine, setWrapLine] = useAtom(diffWrapLineAtom)
  const [searchQuery] = useAtom(searchQueryAtom)
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(lastOpenedFilePathAtom)
  const [files] = useAtom(diffResultAtom)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<{ [key: string]: number }>({})
  const [diffDetail] = useAtom(diffDetailAtom)

  const selectedFile = files?.files?.find(f => f.file === lastOpenedFilePath)
  const ext = selectedFile?.file.split(".").pop()?.toLowerCase() || "text"
  const language = useMemo(() => getLanguageFromExtension(ext), [ext])

  const diffFiles = useMemo(() => {
    if (!diffDetail?.ok || !selectedFile) return []
    return parseDiff(diffDetail.data.diff)
  }, [diffDetail, selectedFile])

  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current && lastOpenedFilePath) {
      scrollPositionRef.current[lastOpenedFilePath] = scrollContainerRef.current.scrollTop
    }
  }, [lastOpenedFilePath])

  useEffect(() => {
    if (scrollContainerRef.current && lastOpenedFilePath) {
      const savedPosition = scrollPositionRef.current[lastOpenedFilePath]
      if (savedPosition !== undefined) {
        scrollContainerRef.current.scrollTop = savedPosition
      } else {
        scrollContainerRef.current.scrollTop = 0
      }
    }
  }, [lastOpenedFilePath])

  if (!selectedFile) {
    return null
  }

  if (selectedFile.binary) {
    return <div className="flex items-center justify-center h-full">No diff available</div>
  }

  const handleClose = () => {
    saveScrollPosition()
    setLastOpenedFilePath("")
  }

  const file = diffFiles[0]
  if (!file) return null

  const renderToken = (token: string, defaultRender: (token: string) => JSX.Element) => {
    if (!searchQuery) return defaultRender(token)

    const index = token.toLowerCase().indexOf(searchQuery.toLowerCase())
    if (index === -1) return defaultRender(token)

    return (
      <>
        {token.slice(0, index)}
        <span className="bg-yellow-500 bg-opacity-50">
          {token.slice(index, index + searchQuery.length)}
        </span>
        {token.slice(index + searchQuery.length)}
      </>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="border-b min-w-0">
        <div className="flex items-center justify-between p-2 gap-2">
          <div className="min-w-0">
            <span className="font-medium truncate block">{selectedFile.file}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {!selectedFile.binary && (
              <>
                <span className="text-green-600 dark:text-green-400">
                  +{selectedFile.insertions}
                </span>
                <span className="text-red-600 dark:text-red-400">-{selectedFile.deletions}</span>
              </>
            )}
            <VSCodeButton
              appearance="icon"
              className={cn(
                wrapLine && "bg-[var(--vscode-toolbar-activeBackground)]",
                "rounded-[3px]",
              )}
              title={wrapLine ? "Disable Line Wrap" : "Enable Line Wrap"}
              onClick={() => setWrapLine(!wrapLine)}
            >
              <i className={cn("codicon codicon-word-wrap transition-transform")} />
            </VSCodeButton>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn("flex-1 overflow-auto diff-container", wrapLine && "wrap")}
      >
        <Diff
          diffType={file.type}
          hunks={file.hunks}
          renderToken={renderToken}
          tokens={file.tokens}
          viewType="unified"
        />
      </div>
    </div>
  )
}

const getLanguageFromExtension = (ext: string): string => {
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    // Add more mappings as needed
  }

  return languageMap[ext] || "text"
}
