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
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"

import { FileItem } from "./FileItem"

interface TreeNodeProps {
  path: string
  files: any[]
  level: number
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
  getFolderFileCount: (path: string) => number
}

const TreeNode: React.FC<TreeNodeProps> = ({
  path,
  files,
  level,
  selectedPath,
  searchQuery,
  onClick,
  getFolderFileCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const filesInPath = files.filter((file) => file.file.startsWith(path))

  const handleToggle = () => setIsExpanded(!isExpanded)

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group"
        role="button"
        style={{ paddingLeft: `${level * 16}px` }}
        tabIndex={0}
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
        <div className="flex-1 flex items-center min-w-0 h-full">
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
            <span className="truncate">{path}</span>
            <span className="text-xs text-gray-500">
              ({getFolderFileCount(path)})
            </span>
          </div>
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
              viewMode="tree"
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
  className?: string
}

export const TreeView: React.FC<TreeViewProps> = ({
  selectedPath,
  searchQuery,
  onClick,
  className,
}) => {
  const [diffResult] = useAtom(diffResultAtom)
  const files = diffResult?.files || []
  const [isRootExpanded, setIsRootExpanded] = React.useState(true)

  const getFolderFileCount = React.useCallback(
    (path: string) => {
      return files.filter((file) => file.file.startsWith(path + "/")).length
    },
    [files]
  )

  const getFolders = React.useCallback(() => {
    const folders = new Set<string>()
    files.forEach((file) => {
      const parts = file.file.split("/")
      parts.pop() // Remove filename
      let path = ""
      parts.forEach((part) => {
        path = path ? `${path}/${part}` : part
        folders.add(path)
      })
    })
    return Array.from(folders).sort()
  }, [files])

  // Get root directory files (files without a path)
  const rootFiles = files.filter((file) => !file.file.includes("/"))

  return (
    <div className={className}>
      {/* Root Node */}
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsRootExpanded(!isRootExpanded)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsRootExpanded(!isRootExpanded)
          }
        }}
      >
        <div className="flex-1 flex items-center min-w-0 h-full">
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsRootExpanded(!isRootExpanded)
              }}
            >
              {isRootExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
            <span className="font-semibold">Staged </span>
            {files.length > 0 && (
              <span className="text-xs text-gray-500">({files.length})</span>
            )}
          </div>
        </div>
      </div>

      {isRootExpanded && (
        <div>
          {/* Root directory files */}
          {rootFiles.map((file, index) => (
            <FileItem
              key={`root-${index}`}
              diff="todo: diff"
              file={file}
              isOpen={selectedPath === file.file}
              level={1}
              searchQuery={searchQuery}
              viewMode="tree"
              onClick={onClick}
            />
          ))}

          {/* Folders and their files */}
          {getFolders().map((folder) => (
            <TreeNode
              key={folder}
              files={files}
              getFolderFileCount={getFolderFileCount}
              level={1}
              onClick={onClick}
              path={folder}
              searchQuery={searchQuery}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
