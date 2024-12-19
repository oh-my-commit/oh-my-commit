import { diffResultAtom } from "@/state/atoms/commit.changed-files"
import { useAtom } from "jotai"
import React from "react"
import type { FileChange } from "../../../state/types"
import { FileItem } from "./FileItem"

export interface FlatViewProps {
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  hasOpenedFile: boolean
  onSelect: (path: string) => void
  onClick: (path: string) => void
  renderStatus?: (file: FileChange & { isStaged: boolean }) => React.ReactNode
  className?: string
}

export const FlatView: React.FC<FlatViewProps> = ({
  selectedFiles,
  selectedPath,
  searchQuery,
  hasOpenedFile,
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
          file={file}
          diff={diff}
          selected={selectedFiles.includes(file.file)}
          isOpen={selectedPath === file.file}
          viewMode="flat"
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
