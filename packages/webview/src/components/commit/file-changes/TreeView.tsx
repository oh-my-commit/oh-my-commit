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
  selectedFiles: string[]
  selectedPath?: string
  searchQuery?: string
  onSelect: (paths: string[]) => void
  onClick: (path: string) => void
  getFolderFileCount: (path: string) => number
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
  getFolderFileCount,
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
          <button
            aria-label={isAllSelected ? "Deselect folder" : "Select folder"}
            className="checkbox-container flex items-center justify-center w-8 h-full transition-opacity duration-100"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleFolderSelect()
            }}
          >
            <input
              readOnly
              checked={isAllSelected}
              className="h-3 w-3"
              style={{ opacity: isPartiallySelected ? "0.5" : "1" }}
              type="checkbox"
            />
          </button>

          <div className="flex items-center gap-1">
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
            <span>{path.split("/").pop()}</span>
            <span className="text-xs text-gray-500">({getFolderFileCount(path)})</span>
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

  // 构建文件树结构和计算每个文件夹的文件数
  const fileTree = React.useMemo(() => {
    const paths = files.map((file) => file.file)
    const uniqueFolders = new Set<string>()
    const folderFiles = new Map<string, Set<string>>()

    // 首先收集所有文件夹路径
    paths.forEach((path) => {
      const parts = path.split("/")
      parts.pop() // 移除文件名
      let currentPath = ""
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        uniqueFolders.add(currentPath)
        if (!folderFiles.has(currentPath)) {
          folderFiles.set(currentPath, new Set())
        }
      })
    })

    // 然后将每个文件添加到其所有父文件夹中
    paths.forEach((path) => {
      const parts = path.split("/")
      parts.pop() // 移除文件名
      let currentPath = ""
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        folderFiles.get(currentPath)?.add(path)
      })
    })

    return {
      folders: Array.from(uniqueFolders),
      files: folderFiles,
    }
  }, [files])

  const getFolderFileCount = (folderPath: string) => {
    // 获取当前文件夹下的直接文件
    const directFiles = fileTree.files.get(folderPath) || new Set()

    // 获取子文件夹中的文件
    const childFiles = files.filter((file) => {
      const filePath = file.file
      const fileParentPath = filePath.split("/").slice(0, -1).join("/")

      // 如果是根目录文件（没有父路径）且当前是根文件夹
      if (!fileParentPath && !folderPath) {
        return true
      }

      // 常规文件夹的情况
      return (
        filePath.startsWith(folderPath + "/") &&
        !Array.from(fileTree.folders).some(
          (folder) =>
            folder !== folderPath &&
            folder.startsWith(folderPath + "/") &&
            filePath.startsWith(folder + "/")
        )
      )
    })

    return childFiles.length + directFiles.size
  }

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
        <div className="flex-1 flex items-center min-w-0 h-full">
          <button
            aria-label={isAllSelected ? "Deselect all" : "Select all"}
            className="checkbox-container flex items-center justify-center w-8 h-full transition-opacity duration-100"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(files.map((file) => file.file))
            }}
          >
            <input
              readOnly
              checked={isAllSelected}
              className="h-3 w-3"
              style={{ opacity: isPartiallySelected ? "0.5" : "1" }}
              type="checkbox"
            />
          </button>

          <div className="flex items-center gap-1">
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
            <span className="font-semibold">Staged Changes</span>
            {files.length > 0 && <span className="text-xs text-gray-500">({files.length})</span>}
          </div>
        </div>
      </div>

      {/* 文件树 */}
      {isRootExpanded && (
        <div className="flex flex-col">
          {/* 根目录文件和文件夹混合排序 */}
          {[
            // 根目录文件转换为类似文件夹的结构
            ...files
              .filter((file) => !file.file.includes("/"))
              .map((file) => ({
                type: "file" as const,
                file,
              })),
            // 文件夹
            ...fileTree.folders.map((path) => ({
              type: "folder" as const,
              path,
            })),
          ]
            .sort((a, b) => {
              // 文件夹优先
              if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1
              }
              // 同类型按名字排序
              const aName = a.type === "folder" ? a.path : a.file.file
              const bName = b.type === "folder" ? b.path : b.file.file
              return aName.localeCompare(bName)
            })
            .map((item) =>
              item.type === "folder" ? (
                <TreeNode
                  key={item.path}
                  files={files}
                  getFolderFileCount={getFolderFileCount}
                  level={1}
                  onClick={onClick}
                  onSelect={handleTreeNodeSelect}
                  path={item.path}
                  searchQuery={searchQuery}
                  selectedFiles={selectedFiles}
                  selectedPath={selectedPath}
                />
              ) : (
                <FileItem
                  key={item.file.file}
                  diff="todo: diff"
                  file={item.file}
                  isOpen={selectedPath === item.file.file}
                  level={1}
                  searchQuery={searchQuery}
                  selected={selectedFiles.includes(item.file.file)}
                  viewMode="tree"
                  onClick={onClick}
                  onSelect={handleFileSelect}
                />
              )
            )}
        </div>
      )}
    </div>
  )
}
