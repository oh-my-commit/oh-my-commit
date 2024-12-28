/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"
import { useEffect } from "react"

import type { DiffResult } from "simple-git"

import { HighlightText } from "@/components/common/HighlightText"
import { cn } from "@/lib/utils"
import { clientPush } from "@/utils/clientPush"
import { basename } from "@/utils/path"

interface FileItemProps {
  file: DiffResult["files"][0]
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
        "group flex items-center h-[32px] select-none cursor-pointer transition-colors duration-100 ease-in-out w-full text-left",
        isOpen
          ? "bg-list-active-bg text-list-active-fg shadow-sm"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      role="button"
      style={
        viewMode === "tree"
          ? { paddingLeft: `${(level || 0) * 16 + 16}px` }
          : {}
      }
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick(e)}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <div className="flex-1 truncate text-[13px] pl-1 pr-2">
          <div className="flex items-center gap-0.5 transition-colors duration-100">
            {/* // todo: STATUS */}
            <span
              className={cn(
                "font-mono font-medium text-[12px]"
                // STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
              )}
              // title={STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]}
            >
              {/* {STATUS_LETTERS[file.status as keyof typeof STATUS_LETTERS]} */}
            </span>
          </div>

          <span className="truncate">
            <HighlightText
              highlight={searchQuery}
              text={viewMode === "tree" ? basename(file.file) : file.file}
              onMatchCount={setPathMatchCount}
            />
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 px-2 text-[12px] tabular-nums transition-colors duration-100"
        )}
      >
        {searchQuery && (pathMatchCount > 0 || contentMatchCount > 0) && (
          <span
            className={cn(
              "text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)] px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1"
            )}
          >
            {pathMatchCount > 0 && (
              <span title="Matches in filename">{pathMatchCount}</span>
            )}
            {pathMatchCount > 0 && contentMatchCount > 0 && (
              <span className="opacity-40">·</span>
            )}
            {contentMatchCount > 0 && (
              <span title="Matches in content">{contentMatchCount}</span>
            )}
          </span>
        )}
        {!file.binary && file.insertions > 0 && (
          <span className={cn("text-git-added-fg")}>+{file.insertions}</span>
        )}
        {!file.binary && file.deletions > 0 && (
          <span className={cn("text-git-deleted-fg")}>−{file.deletions}</span>
        )}
      </div>
    </div>
  )
}
