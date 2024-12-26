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
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  onSelect: (paths: string | string[]) => void
  onClick: (path: string) => void
  className?: string
}

export const FileChangesView: React.FC<FileChangesViewProps> = ({
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
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
          selectedFiles={selectedFiles}
          selectedPath={selectedPath}
          onClick={onClick}
          onSelect={onSelect}
        />
      ) : (
        <TreeView
          className={className}
          searchQuery={searchQuery}
          selectedFiles={selectedFiles}
          selectedPath={selectedPath}
          onClick={onClick}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
