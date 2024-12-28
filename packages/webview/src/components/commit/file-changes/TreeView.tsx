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
import type {
  DiffResult,
  DiffResultBinaryFile,
  DiffResultNameStatusFile,
  DiffResultTextFile,
} from "simple-git"

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

    const parts = file.file.split("/")
    let current = tree
    let currentPath: string = ""

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      if (!name) continue

      currentPath = currentPath ? `${currentPath}/${name}` : name
      const isFile = i === parts.length - 1

      let node = current.find((n) => n.name === name)
      if (!node) {
        const newNode: FileTreeNode = {
          name: name,
          path: currentPath,
          type: isFile ? "file" : "directory",
          children: [],
          ...(isFile ? { file } : {}),
        }
        current.push(newNode)
        node = newNode

        // Sort after insertion
        current.sort((a, b) => {
          if (a.type !== b.type) return a.type === "directory" ? -1 : 1
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

  if (node.type === "file") {
    return (
      <FileItem
        key={node.path}
        diff="todo: diff"
        file={node.file!}
        isOpen={selectedPath === node.path}
        level={level}
        searchQuery={searchQuery}
        viewMode="tree"
        onClick={onClick}
      />
    )
  }

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 cursor-pointer group"
        role="button"
        style={{ paddingLeft: `${level * 16}px` }}
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
            <span className="truncate">{node.name}</span>
            <span className="text-xs text-gray-500">
              ({node.children.length})
            </span>
          </div>
        </div>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
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
  const [isRootExpanded, setIsRootExpanded] = React.useState(true)
  const tree = React.useMemo(() => buildFileTree(files), [files])

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
            <span className="font-semibold">Staged</span>
            {files.length > 0 && (
              <span className="text-xs text-gray-500">({files.length})</span>
            )}
          </div>
        </div>
      </div>

      {isRootExpanded && tree.length > 0 && (
        <div>
          {tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              level={1}
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
