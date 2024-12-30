/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import { useAtom } from "jotai"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"

import { FileItem } from "./FileItem"
import { StagedSection } from "./StagedSection"

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

  return (
    <div className={className}>
      <StagedSection count={files.length}>
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
      </StagedSection>
    </div>
  )
}
