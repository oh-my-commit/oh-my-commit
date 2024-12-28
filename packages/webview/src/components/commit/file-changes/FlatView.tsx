/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import { useAtom } from "jotai"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"

import { FileItem } from "./FileItem"

export interface FlatViewProps {
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
  className?: string
}

export const FlatView: React.FC<FlatViewProps> = ({
  selectedPath,
  searchQuery,
  onClick,
  className,
}) => {
  const [diffResult] = useAtom(diffResultAtom)
  const files = diffResult?.files || []
  const [isExpanded, setIsExpanded] = React.useState(true)

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={className}>
      {/* Staged Files Header */}
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group rounded-md"
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle(e)
          }
        }}
      >
        <div className="flex-1 flex items-center min-w-0 h-full">
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
            <span className="font-semibold">Staged</span>
            {files.length > 0 && (
              <span className="text-xs text-gray-500">({files.length})</span>
            )}
          </div>
        </div>
      </div>

      {/* Staged Files List */}
      {isExpanded && (
        <div className="mt-1">
          {files.map((file, index) => (
            <FileItem
              key={index}
              diff="todo: diff"
              file={file}
              isOpen={selectedPath === file.file}
              level={0}
              searchQuery={searchQuery}
              viewMode="flat"
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
