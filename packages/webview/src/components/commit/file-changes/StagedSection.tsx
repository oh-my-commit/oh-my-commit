/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import cn from "classnames"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { ViewMode } from "@/state/atoms/commit.changed-files"

interface StagedSectionProps {
  title?: string
  count?: number
  children: React.ReactNode
  className?: string
}

export const StagedSection: React.FC<StagedSectionProps> = ({ title = "Staged", count, children, className }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div
        className={cn(
          "group relative flex items-center h-9 select-none cursor-pointer rounded-md transition-all duration-150 w-full text-left",
          "hover:bg-gray-100/80 dark:hover:bg-gray-800/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
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
          <div className="flex items-center gap-1.5">
            <button
              className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
            </button>
            <span className="font-medium">{title}</span>
            {count !== undefined && count > 0 && <span className="text-xs text-gray-500">({count})</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && <div className="mt-1 pl-2">{children}</div>}
    </div>
  )
}
