/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import { useAtom } from "jotai"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import type {
  DiffResult,
  DiffResultBinaryFile,
  DiffResultNameStatusFile,
  DiffResultTextFile,
} from "simple-git"

import { logger } from "@/lib/vscode-client-logger"
import { diffResultAtom } from "@/state/atoms/commit.changed-files"

import { FileItem } from "./FileItem"

type GitDiffFile =
  | DiffResultTextFile
  | DiffResultBinaryFile
  | DiffResultNameStatusFile

interface TreeNodeProps {
  node: FileTreeNode
  level: number
  selectedPath?: string
  searchQuery?: string
  onClick: (path: string) => void
}

interface FileTreeNode {
  name: string
  path: string
  type: "file" | "directory"
  children: FileTreeNode[]
  file?: GitDiffFile
}

const buildFileTree = (files: DiffResult["files"]): FileTreeNode[] => {
  const tree: FileTreeNode[] = []

  for (const file of files) {
    if (!file.file) continue

    // 规范化路径分隔符为 /
    const normalizedPath = file.file.replace(/\\/g, "/")
    const parts = normalizedPath.split("/").filter(Boolean)
    let current = tree
    let currentPath = ""

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]!
      currentPath = currentPath ? `${currentPath}/${name}` : name
      const isFile = i === parts.length - 1

      let node = current.find((n) => n.name === name)
      if (!node) {
        node = {
          name,
          path: currentPath,
          type: isFile ? "file" : "directory",
          children: [],
          ...(isFile ? { file } : {}),
        }
        current.push(node)

        // 对目录进行排序：目录在前，文件在后，同类型按名称排序
        current.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }

      current = node.children
    }
  }

  return tree
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  selectedPath,
  searchQuery,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  // 如果是文件节点
  if (node.type === "file" && node.file) {
    return (
      <FileItem
        file={node.file}
        isOpen={selectedPath === node.path}
        level={level}
        searchQuery={searchQuery}
        viewMode="tree"
        onClick={onClick}
      />
    )
  }

  // 如果是目录节点
  return (
    <div>
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group rounded-md"
        style={{ paddingLeft: `${level * 16}px` }}
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle(e)
          }
        }}
      >
        <button
          className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        >
          {isExpanded ? (
            <ChevronDownIcon className="w-3 h-3" />
          ) : (
            <ChevronRightIcon className="w-3 h-3" />
          )}
        </button>
        <span className="text-sm">{node.name}</span>
        {node.children.length > 0 && (
          <span className="text-xs text-gray-500">
            ({node.children.length})
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="pl-2">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              searchQuery={searchQuery}
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
  const [isExpanded, setIsExpanded] = React.useState(true)

  const tree = React.useMemo(() => buildFileTree(files), [files])
  logger.info("tree", tree)

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={className}>
      {/* Staged Files Header */}
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group rounded-md"
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle(e)
          }
        }}
      >
        <div className="flex-1 flex items-center min-w-0 h-full">
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
            <span className="font-semibold">Staged</span>
            {files.length > 0 && (
              <span className="text-xs text-gray-500">({files.length})</span>
            )}
          </div>
        </div>
      </div>

      {/* Tree View */}
      {isExpanded && (
        <div className="mt-1">
          {tree.map((node, index) => (
            <TreeNode
              key={index}
              node={node}
              level={0}
              selectedPath={selectedPath}
              searchQuery={searchQuery}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
