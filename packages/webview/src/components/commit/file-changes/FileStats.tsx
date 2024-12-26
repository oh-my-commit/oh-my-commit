/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react"

interface FileStatsProps {
  stats: {
    added: number
    modified: number
    deleted: number
    renamed: number
  }
  className?: string
}

export const FileStats: React.FC<FileStatsProps> = ({ stats, className }) => {
  return (
    <div
      className={`flex items-center gap-2 text-[12px] text-[var(--vscode-descriptionForeground)] ${className}`}
    >
      <span>{Object.values(stats).reduce((a, b) => a + b, 0)} files</span>
      <span>·</span>
      <span className="text-[var(--vscode-gitDecoration-addedResourceForeground)]">
        +{stats.added}
      </span>
      <span>·</span>
      <span className="text-[var(--vscode-gitDecoration-deletedResourceForeground)]">
        -{stats.deleted}
      </span>
    </div>
  )
}
