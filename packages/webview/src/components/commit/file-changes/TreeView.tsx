/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useAtom } from "jotai"
import { ChevronDownIcon, ChevronRightIcon, FolderIcon } from "lucide-react"
import * as React from "react"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"
import { FileItem } from "./FileItem"

interface TreeNodeProps {
  path: string
  files: any[]
  level: number
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  onSelect: (paths: string[]) => void
  onClick: (path: string) => void
}

const TreeNode: React.FC<TreeNodeProps> = ({
  path,
  files,
  level,
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const filesInPath = files.filter(file => file.file.startsWith(path))

  const handleToggle = () => setIsExpanded(!isExpanded)

  const isAllSelected = filesInPath.every(file => selectedFiles.includes(file.file))
  const isPartiallySelected =
    !isAllSelected && filesInPath.some(file => selectedFiles.includes(file.file))

  const handleFolderSelect = () => {
    const filePaths = filesInPath.map(file => file.file)
    onSelect(filePaths)
  }

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <button className="p-1" onClick={handleToggle}>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        <button className="flex items-center gap-1" onClick={handleFolderSelect}>
          <FolderIcon className="h-4 w-4" />
          <span>{path.split("/").pop()}</span>
        </button>
      </div>
      {isExpanded && (
        <div>
          {filesInPath.map((file, index) => (
            <FileItem
              key={index}
              diff="todo: diff"
              file={file}
              isOpen={selectedPath === file.file}
              level={level + 1}
              searchQuery={searchQuery}
              selected={selectedFiles.includes(file.file)}
              viewMode="tree"
              onClick={onClick}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export interface TreeViewProps {
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  onSelect: (paths: string[]) => void
  onClick: (path: string) => void
  className?: string
}

export const TreeView: React.FC<TreeViewProps> = ({
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onClick,
  className,
}) => {
  const [diffResult] = useAtom(diffResultAtom)

  const getDirectoryStructure = (files: any[]) => {
    const directories = new Set<string>()
    files.forEach(file => {
      const parts = file.file.split("/")
      parts.pop() // remove filename
      let path = ""
      parts.forEach(part => {
        path = path ? `${path}/${part}` : part
        directories.add(path)
      })
    })
    return Array.from(directories).sort()
  }

  const directories = getDirectoryStructure(diffResult?.files || [])

  return (
    <div className={className}>
      {directories.map(dir => (
        <TreeNode
          key={dir}
          files={diffResult?.files || []}
          level={0}
          path={dir}
          searchQuery={searchQuery}
          selectedFiles={selectedFiles}
          selectedPath={selectedPath}
          onClick={onClick}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
