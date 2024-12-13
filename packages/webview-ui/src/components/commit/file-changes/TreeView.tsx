import {
  expandedDirsAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";

import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths";
import { getSubDirectories } from "@/utils/get-sub-directories";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { cn } from "../../../lib/utils";
import { Checkbox } from "../../common/Checkbox";
import { FileItem } from "./FileItem";
import { FileChange, TreeNode } from "@yaac/shared";

interface TreeViewProps {
  fileTree: TreeNode;
  onFileSelect?: (path: string) => void;
  onFileClick?: (path: string) => void;
  renderStatus?: (file: FileChange & { isStaged: boolean }) => React.ReactNode;
  className?: string;
}

export const TreeView = ({
  fileTree,
  onFileClick,
  onFileSelect,
  renderStatus,
  className,
}: TreeViewProps) => {
  const [expandedDirsArray, setExpandedDirsArray] = useAtom(expandedDirsAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFile, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom
  );
  const expandedDirsSet = new Set(expandedDirsArray);
  const setExpandedDirs = (dirs: Set<string>) => {
    setExpandedDirsArray(Array.from(dirs));
  };

  const [searchQuery] = useAtom(searchQueryAtom);

  // Auto-expand parent directories of selected path
  useEffect(() => {
    if (lastOpenedFile) {
      const parts = lastOpenedFile.split("/");
      const parentDirs = new Set(expandedDirsSet);

      // Build parent directory paths and add them to expanded set
      let currentPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        parentDirs.add(currentPath);
      }

      setExpandedDirs(parentDirs);
    }
  }, [lastOpenedFile]);

  // Function to collect all directory paths from the tree

  // Initialize expanded dirs only when there's no persisted state
  useEffect(() => {
    if (expandedDirsArray.length === 0) {
      const allDirPaths = getAllDirectoryPaths(fileTree);
      setExpandedDirs(new Set(allDirPaths));
    }
  }, []); // 只在组件首次挂载时执行

  // Toggle directory expansion
  const toggleDir = (path: string) => {
    const newExpandedDirs = new Set(expandedDirsSet);

    if (expandedDirsSet.has(path)) {
      // When collapsing, remove this dir and all its subdirs
      newExpandedDirs.delete(path);
      const subDirs = getSubDirectories(fileTree, path);
      subDirs.forEach((dir) => newExpandedDirs.delete(dir));
    } else {
      // When expanding, only add this dir and its immediate children
      newExpandedDirs.add(path);
      const immediateChildren =
        fileTree.children
          ?.filter(
            (node) =>
              node.type === "directory" && node.path.startsWith(path + "/")
          )
          ?.filter((node) => !node.path.slice(path.length + 1).includes("/"))
          ?.map((node) => node.path) || [];
      immediateChildren.forEach((dir) => newExpandedDirs.add(dir));
    }

    setExpandedDirs(newExpandedDirs);
  };

  const getDirectoryFiles = (node: TreeNode): string[] => {
    const files: string[] = [];
    if (node.type === "file" && node.fileInfo) {
      files.push(node.fileInfo.path);
    } else if (node.children) {
      node.children.forEach((child) => {
        files.push(...getDirectoryFiles(child));
      });
    }
    return files;
  };

  const handleDirSelect = (node: TreeNode, checked: boolean) => {
    const dirFiles = getDirectoryFiles(node);
    const newSelectedFiles = checked
      ? [...new Set([...selectedFiles, ...dirFiles])]
      : selectedFiles.filter((path) => !dirFiles.includes(path));
    setSelectedFiles(newSelectedFiles);
  };

  const handleClick = (node: TreeNode, path: string) => {
    if (node.type === "file") {
      if (node.fileInfo) {
        const file = node.fileInfo;
        onFileClick?.(path);
      }
    } else {
      toggleDir(path);
    }
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    if (node.type === "file" && node.fileInfo) {
      const { path } = node.fileInfo;
      const isActive = lastOpenedFile === path;
      const isSelected = selectedFiles.includes(path);

      return (
        <div
          key={path}
          className={cn(
            "flex items-center gap-2 rounded-sm cursor-pointer group",
            isActive && "bg-[var(--vscode-list-activeSelectionBackground)]",
            !isActive && "hover:bg-[var(--vscode-list-hoverBackground)]"
          )}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <FileItem
            file={node.fileInfo}
            isSelected={isSelected}
            isActive={isActive}
            hasOpenedFile={!!lastOpenedFile}
            searchQuery={searchQuery}
            onSelect={onFileSelect}
            onClick={(path, metaKey) => handleClick(node, path)}
          />
        </div>
      );
    }

    const isExpanded = expandedDirsSet.has(node.path);
    const hasChildren = node.children?.length > 0;
    const nodeKey = node.path || "root";
    const showDirUI = node.path || level > 0;

    return (
      <div key={nodeKey}>
        {showDirUI && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-sm group",
              "text-[var(--vscode-descriptionForeground)]",
              "hover:bg-[var(--vscode-list-hoverBackground)]"
            )}
          >
            <div
              className="flex items-center"
              style={{ marginLeft: `${level * 16}px` }}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-full",
                  "cursor-pointer opacity-60 group-hover:opacity-100"
                )}
                onClick={() => handleClick(node, node.path)}
              >
                {hasChildren && (
                  <i
                    className={cn(
                      "codicon text-[12px]",
                      isExpanded ? "codicon-chevron-down" : "codicon-chevron-right"
                    )}
                  />
                )}
              </div>
              <div className="flex items-center justify-center w-8 h-full">
                <Checkbox
                  checked={
                    hasChildren
                      ? node.children.every((child) => {
                          const childFiles = getDirectoryFiles(child);
                          return childFiles.every((file) =>
                            selectedFiles.includes(file)
                          );
                        })
                      : false
                  }
                  onChange={(checked) => handleDirSelect(node, checked)}
                  className="opacity-60 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div
              className="flex items-center gap-1 flex-1 cursor-pointer min-w-0 py-1"
              onClick={() => handleClick(node, node.path)}
            >
              <i
                className={cn(
                  "codicon codicon-folder",
                  "text-[var(--vscode-gitDecoration-submoduleResourceForeground)]",
                  "opacity-60 group-hover:opacity-100"
                )}
              />
              <span className="truncate text-[13px]">
                {node.displayName || "/"}
              </span>
              {hasChildren && (
                <span className="ml-1 text-[11px] opacity-60 tabular-nums">
                  {node.children.length}
                </span>
              )}
            </div>
          </div>
        )}

        {(isExpanded || !node.path) &&
          node.children?.map((child) => (
            renderTreeNode(child, level + 1)
          ))}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {renderTreeNode(fileTree)}
    </div>
  );
};
