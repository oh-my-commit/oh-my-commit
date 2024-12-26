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
import ReactDiffViewer from "react-diff-viewer-continued"

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

  // 解析 diff 内容为新旧文本
  const { oldText, newText } = useMemo(() => {
    if (!diffDetail?.ok) return { oldText: "", newText: "" }

    const lines = diffDetail.data.diff.split("\n")
    const oldLines: string[] = []
    const newLines: string[] = []

    lines.forEach(line => {
      if (line.startsWith("-")) {
        oldLines.push(line.slice(1))
      } else if (line.startsWith("+")) {
        newLines.push(line.slice(1))
      } else {
        oldLines.push(line)
        newLines.push(line)
      }
    })

    return {
      oldText: oldLines.join("\n"),
      newText: newLines.join("\n"),
    }
  }, [diffDetail])

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

      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <ReactDiffViewer
          codeFoldMessageRenderer={() => null}
          extraLinesSurroundingDiff={3}
          hideLineNumbers={false}
          newValue={newText}
          oldValue={oldText}
          showDiffOnly={false}
          splitView={false}
          styles={{
            contentText: {
              whiteSpace: wrapLine ? "pre-wrap" : "pre",
              wordBreak: wrapLine ? "break-word" : "normal",
            },
          }}
          useDarkTheme={true}
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
