/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react"

import { useAtom } from "jotai"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"

import { FileItem } from "./FileItem"

export interface FlatViewProps {
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  onSelect: (path: string) => void
  onClick: (path: string) => void
  className?: string
}

export const FlatView: React.FC<FlatViewProps> = ({
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onClick,
  className,
}) => {
  const [diffResult] = useAtom(diffResultAtom)
  const diff = "todo: diff" // todo
  return (
    <div className={className}>
      {diffResult?.files.map((file, index) => (
        <FileItem
          key={index}
          diff={diff}
          file={file}
          isOpen={selectedPath === file.file}
          searchQuery={searchQuery}
          selected={selectedFiles.includes(file.file)}
          viewMode="flat"
          onClick={onClick}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
