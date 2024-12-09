import {
  expandedDirsAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { TreeNode } from "@/types/tree-node";
import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths";
import { getSubDirectories } from "@/utils/get-sub-directories";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { cn } from "../../../lib/utils";
import { HighlightText } from "../../common/HighlightText";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from "./constants";

interface TreeViewProps {
  fileTree: TreeNode;
  onFileSelect?: (path: string) => void;
  onFileClick?: (path: string) => void;
}

export const TreeView = ({
  fileTree,
  onFileClick,
  onFileSelect,
}: TreeViewProps) => {
  const [expandedDirsArray, setExpandedDirsArray] = useAtom(expandedDirsAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFile, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom,
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
              node.type === "directory" && node.path.startsWith(path + "/"),
          )
          ?.filter((node) => !node.path.slice(path.length + 1).includes("/"))
          ?.map((node) => node.path) || [];
      immediateChildren.forEach((dir) => newExpandedDirs.add(dir));
    }

    setExpandedDirs(newExpandedDirs);
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
      const file = node.fileInfo;
      const isActive = lastOpenedFile === file.path;
      const isSelected = selectedFiles.includes(file.path);

      return (
        <div
          key={file.path}
          style={{ paddingLeft: `${level * 16}px` }}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-sm cursor-pointer group",
            isActive && "bg-[var(--vscode-list-activeSelectionBackground)]",
            !isActive && "hover:bg-[var(--vscode-list-hoverBackground)]",
          )}
          onClick={() => handleClick(node, file.path)}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onFileSelect?.(file.path)}
          />
          <span
            className={cn(
              STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
              isActive && "text-inherit",
            )}
            title={STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]}
          >
            {STATUS_LETTERS[file.status as keyof typeof STATUS_LETTERS]}
          </span>
          <span className="flex-1 truncate">
            <HighlightText text={node.displayName} highlight={searchQuery} />
          </span>
          <div className="flex items-center gap-1 text-xs opacity-60">
            {file.additions > 0 && (
              <span
                className={cn("text-git-added-fg", isActive && "text-inherit")}
              >
                +{file.additions}
              </span>
            )}
            {file.deletions > 0 && (
              <span
                className={cn(
                  "text-git-deleted-fg",
                  isActive && "text-inherit",
                )}
              >
                −{file.deletions}
              </span>
            )}
          </div>
        </div>
      );
    }

    const isExpanded = expandedDirsSet.has(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path || "root"}>
        {/* Only show directory node UI if it's not the root or if level > 0 */}
        {(node.path || level > 0) && (
          <div
            style={{ paddingLeft: `${level * 16}px` }}
            className="flex items-center gap-2 px-2 py-1 text-[var(--vscode-descriptionForeground)] cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)] rounded-sm"
            onClick={() => handleClick(node, node.path)}
          >
            {hasChildren && (
              <i
                className={cn(
                  "codicon",
                  isExpanded ? "codicon-chevron-down" : "codicon-chevron-right",
                )}
              />
            )}
            <i className="codicon codicon-folder" />
            <span className="truncate">{node.displayName || "/"}</span>
            {hasChildren && (
              <span className="ml-1 text-xs text-gray-500">
                ({node.children && node.children.length})
              </span>
            )}
          </div>
        )}
        {/* Always render children if expanded, regardless of whether this is root */}
        {(isExpanded || !node.path) &&
          node.children?.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return <div className="flex flex-col">{renderTreeNode(fileTree)}</div>;
};
