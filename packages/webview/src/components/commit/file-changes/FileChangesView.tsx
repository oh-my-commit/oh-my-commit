/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import { useAtom } from "jotai"

import {
  diffResultAtom,
  viewModeAtom,
} from "@/state/atoms/commit.changed-files"

import { FlatView } from "./FlatView"
import { TreeView } from "./TreeView"

interface FileChangesViewProps {
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
  className?: string
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-4 text-center h-full min-h-[200px]">
    <div className="codicon codicon-git-commit text-[32px] text-[var(--vscode-foreground)] opacity-40 mb-2" />
    <p className="text-[var(--vscode-descriptionForeground)] text-sm">
      No changes detected in your workspace.
      <br />
      Make some changes to start committing.
    </p>
  </div>
)

export const FileChangesView: React.FC<FileChangesViewProps> = ({
  selectedPath,
  searchQuery,
  onClick,
  className,
}) => {
  const [viewMode] = useAtom(viewModeAtom)
  const [diffResult] = useAtom(diffResultAtom)
  const files = diffResult?.files || []

  if (!files.length) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      {viewMode === "flat" ? (
        <FlatView
          className={className}
          searchQuery={searchQuery}
          selectedPath={selectedPath}
          onClick={onClick}
        />
      ) : (
        <TreeView
          className={className}
          searchQuery={searchQuery}
          selectedPath={selectedPath}
          onClick={onClick}
        />
      )}
    </div>
  )
}
