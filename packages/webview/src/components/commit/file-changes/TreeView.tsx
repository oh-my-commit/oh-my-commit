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
import { ChevronDownIcon, ChevronRightIcon, FolderIcon } from "lucide-react"

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
  const filesInPath = files.filter((file) => file.file.startsWith(path))

  const handleToggle = () => setIsExpanded(!isExpanded)

  const isAllSelected = filesInPath.every((file) => selectedFiles.includes(file.file))
  const isPartiallySelected =
    !isAllSelected && filesInPath.some((file) => selectedFiles.includes(file.file))

  const handleFolderSelect = () => {
    const filePaths = filesInPath.map((file) => file.file)
    onSelect(filePaths)
  }

  const handleItemSelect = (path: string) => {
    onSelect([path])
  }

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group"
        role="button"
        style={{ paddingLeft: `${level * 16}px` }}
        tabIndex={0}
        onClick={handleFolderSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleFolderSelect()
          }
        }}
      >
        <button
          className="p-1"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleToggle()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleToggle()
            }
          }}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        <div className="flex items-center gap-1 flex-1">
          <FolderIcon className="h-4 w-4" />
          <span>{path.split("/").pop()}</span>
          <span className="text-xs text-gray-500">({filesInPath.length})</span>
        </div>
        <div className="flex items-center">
          <input
            readOnly
            checked={isAllSelected}
            className="h-3 w-3"
            style={{ opacity: isPartiallySelected ? "0.5" : "1" }}
            type="checkbox"
          />
        </div>
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
              onSelect={handleItemSelect}
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
  const files = diffResult?.files || []
  const [isRootExpanded, setIsRootExpanded] = React.useState(true)

  // 构建文件树结构
  const fileTree = React.useMemo(() => {
    const paths = files.map((file) => file.file)
    const uniqueFolders = new Set<string>()

    paths.forEach((path) => {
      const parts = path.split("/")
      parts.pop() // 移除文件名
      let currentPath = ""
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        uniqueFolders.add(currentPath)
      })
    })

    return Array.from(uniqueFolders)
  }, [files])

  const handleRootToggle = () => {
    setIsRootExpanded(!isRootExpanded)
  }

  const handleFileSelect = (path: string) => {
    onSelect([path])
  }

  const handleTreeNodeSelect = (paths: string[]) => {
    onSelect(paths)
  }

  const isAllSelected = files.length > 0 && files.every((file) => selectedFiles.includes(file.file))
  const isPartiallySelected =
    !isAllSelected && files.some((file) => selectedFiles.includes(file.file))

  return (
    <div className={className}>
      {/* 根节点 */}
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group"
        role="button"
        tabIndex={0}
        onClick={() => onSelect(files.map((file) => file.file))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelect(files.map((file) => file.file))
          }
        }}
      >
        <button
          className="p-1"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleRootToggle()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleRootToggle()
            }
          }}
        >
          {isRootExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        <div className="flex items-center gap-1 flex-1">
          <FolderIcon className="h-4 w-4" />
          <span className="font-semibold">Staged Changes</span>
          {files.length > 0 && <span className="text-xs text-gray-500">({files.length})</span>}
        </div>
        {files.length > 0 && (
          <div className="flex items-center">
            <input
              readOnly
              checked={isAllSelected}
              className="h-3 w-3"
              style={{ opacity: isPartiallySelected ? "0.5" : "1" }}
              type="checkbox"
            />
          </div>
        )}
      </div>

      {/* 文件树 */}
      {isRootExpanded &&
        fileTree.map((path) => (
          <TreeNode
            key={path}
            files={files}
            level={1}
            path={path}
            searchQuery={searchQuery}
            selectedFiles={selectedFiles}
            selectedPath={selectedPath}
            onClick={onClick}
            onSelect={handleTreeNodeSelect}
          />
        ))}
    </div>
  )
}
