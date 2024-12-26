/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react"
import { useEffect } from "react"

import type { DiffResult } from "simple-git"

import { HighlightText } from "@/components/common/HighlightText"
import { cn } from "@/lib/utils"
import { basename } from "@/utils/path"

import { Checkbox } from "../../common/Checkbox"

interface FileItemProps {
  file: DiffResult["files"][0]
  diff?: string
  selected: boolean
  isOpen: boolean
  viewMode: string
  searchQuery?: string
  onSelect: (path: string) => void
  onClick: (path: string) => void
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  diff,
  selected,
  isOpen,
  viewMode,
  searchQuery = "",
  onSelect,
  onClick,
}) => {
  const [pathMatchCount, setPathMatchCount] = React.useState(0)
  const [contentMatchCount, setContentMatchCount] = React.useState(0)

  const handleSelect = () => {
    onSelect(file.file)
  }

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
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
      lines.forEach(line => {
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
          : selected
            ? "bg-list-inactive-bg text-list-inactive-fg"
            : "hover:bg-list-hover-bg active:bg-list-active-bg active:bg-opacity-50",
      )}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e)
        }
      }}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <button
          aria-label={selected ? "Deselect file" : "Select file"}
          className="checkbox-container flex items-center justify-center w-8 h-full transition-opacity duration-100"
          type="button"
          onClick={e => {
            e.stopPropagation()
            handleSelect()
          }}
        >
          <Checkbox checked={selected} onChange={handleSelect} />
        </button>

        <div className="flex-1 flex items-center gap-2 truncate text-[13px] pl-1 pr-2">
          <div className="flex items-center gap-0.5 transition-colors duration-100">
            {/* // todo: STATUS */}
            <span
              className={cn(
                "font-mono font-medium text-[12px]",
                // STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                selected && "text-inherit",
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
          "flex items-center gap-2 px-2 text-[12px] tabular-nums transition-colors duration-100",
          !selected && "text-[var(--vscode-descriptionForeground)]",
        )}
      >
        {searchQuery && (pathMatchCount > 0 || contentMatchCount > 0) && (
          <span
            className={cn(
              "text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)] px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1",
              selected && "opacity-80",
            )}
          >
            {pathMatchCount > 0 && <span title="Matches in filename">{pathMatchCount}</span>}
            {pathMatchCount > 0 && contentMatchCount > 0 && <span className="opacity-40">·</span>}
            {contentMatchCount > 0 && <span title="Matches in content">{contentMatchCount}</span>}
          </span>
        )}
        {!file.binary && file.insertions > 0 && (
          <span className={cn("text-git-added-fg", selected && "text-inherit")}>
            +{file.insertions}
          </span>
        )}
        {!file.binary && file.deletions > 0 && (
          <span className={cn("text-git-deleted-fg", selected && "text-inherit")}>
            −{file.deletions}
          </span>
        )}
      </div>
    </div>
  )
}
