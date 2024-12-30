/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"
import { useEffect } from "react"

import type {
  DiffNameStatus,
  DiffResultBinaryFile,
  DiffResultNameStatusFile,
  DiffResultTextFile,
} from "simple-git"

import { HighlightText } from "@/components/common/HighlightText"
import { cn } from "@/lib/utils"
import { clientPush } from "@/utils/clientPush"
import { basename } from "@/utils/path"

export const STATUS_COLORS: Record<DiffNameStatus, string> = {
  A: "text-git-added-fg",
  M: "text-git-modified-fg",
  D: "text-git-deleted-fg",
  R: "text-git-renamed-fg",
  C: "text-git-copied-fg",
  U: "text-git-unmerged-fg",
  X: "text-git-unknown-fg",
  B: "text-git-broken-fg",
  T: "text-git-changed-fg",
} as const

// Type guard to check if file has a valid status
function hasStatus(
  file: DiffResultNameStatusFile | DiffResultBinaryFile | DiffResultTextFile
): file is DiffResultNameStatusFile {
  return (
    "status" in file &&
    typeof file.status === "string" &&
    file.status in STATUS_COLORS
  )
}

interface FileItemProps {
  file: DiffResultNameStatusFile | DiffResultBinaryFile | DiffResultTextFile
  diff?: string
  isOpen: boolean
  viewMode: "flat" | "tree"
  level?: number
  searchQuery?: string
  onClick: (path: string) => void
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  diff,
  isOpen,
  viewMode,
  level,
  searchQuery = "",
  onClick,
}) => {
  const [pathMatchCount, setPathMatchCount] = React.useState(0)
  const [contentMatchCount, setContentMatchCount] = React.useState(0)

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    // 通知扩展在编辑器中打开文件差异视图
    clientPush({
      type: "diff-file",
      data: {
        filePath: file.file,
      },
    })
    onClick(file.file)
  }

  // 检查文件内容中的匹配
  useEffect(() => {
    if (!searchQuery || !diff) {
      setContentMatchCount(0)
      return
    }

    const lines = diff.split("\n")
    let count = 0
    try {
      const regex = new RegExp(searchQuery, "gi")
      lines.forEach((line) => {
        const matches = line.match(regex)
        if (matches) {
          count += matches.length
        }
      })
    } catch (error) {
      // 如果正则表达式无效，忽略错误
      console.warn("Invalid regex in search query:", error)
    }

    setContentMatchCount(count)
  }, [searchQuery, diff])

  // 只要有任何一种匹配就显示
  const hasMatch = !searchQuery || pathMatchCount > 0 || contentMatchCount > 0
  if (!hasMatch) {
    return null
  }

  return (
    <div
      className={cn(
        "group relative flex items-center h-9 select-none cursor-pointer rounded-md transition-all duration-150 w-full text-left",
        isOpen
          ? "bg-list-active-bg/50 text-list-active-fg shadow-sm  ring-primary/10"
          : "hover:bg-gray-100/80 dark:hover:bg-gray-800/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
      role="button"
      aria-expanded={isOpen}
      aria-label={`File: ${file.file}, Status: ${hasStatus(file) ? file.status : "unknown"}`}
      style={
        viewMode === "tree" ? { paddingLeft: `${(level || 0) * 16}px` } : {}
      }
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick(e)}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <div className="flex-1 truncate text-sm">
          <div className="flex items-center gap-1.5 transition-colors duration-150">
            <span
              className={cn(
                "inline-flex items-center justify-center w-4 h-4 font-mono font-medium text-xs",
                hasStatus(file)
                  ? STATUS_COLORS[file.status as keyof typeof STATUS_COLORS]
                  : "text-git-unknown-fg"
              )}
              title={
                hasStatus(file) ? `Status: ${file.status}` : "Unknown status"
              }
            >
              {hasStatus(file) ? file.status : "?"}
            </span>

            <span className="truncate font-medium pl-1">
              <HighlightText
                highlight={searchQuery}
                text={viewMode === "tree" ? basename(file.file) : file.file}
                onMatchCount={setPathMatchCount}
              />
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 px-3 text-xs font-medium tabular-nums transition-colors duration-150"
        )}
      >
        {searchQuery && (pathMatchCount > 0 || contentMatchCount > 0) && (
          <span
            className={cn(
              "text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)] px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5"
            )}
          >
            {pathMatchCount > 0 && (
              <span
                className="flex items-center gap-1"
                title="Matches in filename"
              >
                <span className="opacity-60">名称</span>
                {pathMatchCount}
              </span>
            )}
            {pathMatchCount > 0 && contentMatchCount > 0 && (
              <span className="opacity-40">·</span>
            )}
            {contentMatchCount > 0 && (
              <span
                className="flex items-center gap-1"
                title="Matches in content"
              >
                <span className="opacity-60">内容</span>
                {contentMatchCount}
              </span>
            )}
          </span>
        )}
        {!file.binary && (file.insertions > 0 || file.deletions > 0) && (
          <div className="flex items-center gap-2">
            {file.insertions > 0 && (
              <span
                className={cn("text-git-added-fg flex items-center gap-0.5")}
              >
                <span className="opacity-60">+</span>
                {file.insertions}
              </span>
            )}
            {file.deletions > 0 && (
              <span
                className={cn("text-git-deleted-fg flex items-center gap-0.5")}
              >
                <span className="opacity-60">−</span>
                {file.deletions}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
