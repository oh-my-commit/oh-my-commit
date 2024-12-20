import { HighlightText } from "@/components/common/HighlightText"
import { diffResultAtom, lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files"
import { searchQueryAtom } from "@/state/atoms/search"
import { diffWrapLineAtom } from "@/state/atoms/ui"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import cn from "classnames"
import { useAtom } from "jotai"
import React, { useCallback, useEffect, useMemo, useRef } from "react"

export const DiffViewer: React.FC = () => {
  const [wrapLine, setWrapLine] = useAtom(diffWrapLineAtom)
  const [searchQuery] = useAtom(searchQueryAtom)
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(lastOpenedFilePathAtom)
  const [files] = useAtom(diffResultAtom)

  const selectedFile = files?.files?.find(f => f.file === lastOpenedFilePath) as
    | GitFileChange
    | undefined

  if (!selectedFile) {
    return null
  }

  if (!selectedFile.diff) {
    return <div className="flex items-center justify-center h-full">No diff available</div>
  }

  const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text"
  const language = useMemo(() => getLanguageFromExtension(ext), [ext])

  const lines: string[] = selectedFile.diff.split("\n")

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<{ [key: string]: number }>({})

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

  const handleClose = () => {
    saveScrollPosition()
    setLastOpenedFilePath("")
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
      <div className="border-b min-w-0">
        <div className="flex items-center justify-between p-2 gap-2">
          <div className="min-w-0">
            <span className="font-medium truncate block">{selectedFile.path}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-green-600 dark:text-green-400">+{selectedFile.additions}</span>
            <span className="text-red-600 dark:text-red-400">-{selectedFile.deletions}</span>
            <VSCodeButton
              appearance="icon"
              title={wrapLine ? "Disable Line Wrap" : "Enable Line Wrap"}
              onClick={() => setWrapLine(!wrapLine)}
              className={cn(
                wrapLine && "bg-[var(--vscode-toolbar-activeBackground)]",
                "rounded-[3px]",
              )}
            >
              <i
                className={cn(
                  "codicon codicon-word-wrap transition-transform",
                  wrapLine && "opacity-100",
                  !wrapLine && "opacity-60 hover:opacity-100",
                )}
              />
            </VSCodeButton>
            <VSCodeButton appearance="icon" title="Close diff view" onClick={handleClose}>
              <span className="codicon codicon-close" />
            </VSCodeButton>
          </div>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="min-w-0 overflow-auto h-[calc(100vh-120px)]"
        onScroll={() => saveScrollPosition()}
      >
        <table className="w-full border-collapse">
          <tbody
            className={cn(
              "font-mono text-sm",
              wrapLine && "whitespace-pre-wrap",
              !wrapLine && "whitespace-pre",
            )}
          >
            {lines.map((line, index) => {
              const bgColor = line.startsWith("+")
                ? "bg-opacity-20 bg-[var(--vscode-diffEditor-insertedTextBackground)]"
                : line.startsWith("-")
                  ? "bg-opacity-20 bg-[var(--vscode-diffEditor-removedTextBackground)]"
                  : ""

              return (
                <tr key={index}>
                  <td className={cn("pl-2 py-[1px]", bgColor)}>
                    <HighlightText text={line} highlight={searchQuery || ""} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
