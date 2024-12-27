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

import { viewModeAtom } from "@/state/atoms/ui"

import { FlatView } from "./FlatView"
import { TreeView } from "./TreeView"

interface FileChangesViewProps {
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
  className?: string
}

export const FileChangesView: React.FC<FileChangesViewProps> = ({
  selectedPath,
  searchQuery,
  onClick,
  className,
}) => {
  const [viewMode] = useAtom(viewModeAtom)

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
