import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { cn } from "../../../lib/utils";
import { HighlightText } from "../../common/HighlightText";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from "./constants";
import { atomWithStorage } from "../../../state/storage";
import { TreeNode } from "@/types/tree-node";

// Create atom for expanded directories state
const expandedDirsAtom = atomWithStorage<Set<string>>({
  key: "treeview-expanded-dirs",
  defaultValue: new Set([""]),
  storageType: "both",
});

interface TreeViewProps {
  fileTree: TreeNode;
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  fileTree,
  selectedFiles,
  selectedPath,
  searchQuery = "",
  onSelect,
  onFileClick,
}) => {
  const [expandedDirs, setExpandedDirs] = useAtom(expandedDirsAtom);

  // Function to collect all directory paths from the tree
  const getAllDirectoryPaths = (
    node: TreeNode,
    parentPath: string = ""
  ): string[] => {
    const currentPath = parentPath
      ? `${parentPath}/${node.displayName}`
      : node.displayName;
    if (node.type === "directory" && node.children) {
      return [
        currentPath,
        ...node.children.flatMap((child) =>
          getAllDirectoryPaths(child, currentPath)
        ),
      ];
    }
    return [];
  };

  // Expand all directories by default
  useEffect(() => {
    const allDirPaths = getAllDirectoryPaths(fileTree);
    setExpandedDirs(new Set(["", ...allDirPaths]));
  }, [fileTree]);

  // Toggle directory expansion
  const toggleDir = (path: string) => {
    setExpandedDirs(
      new Set(
        [...Array.from(expandedDirs)]
          .filter((p) => p !== path)
          .concat(expandedDirs.has(path) ? [] : [path])
      )
    );
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
      const isActive = selectedPath === file.path;
      const isSelected = selectedFiles.includes(file.path);

      return (
        <div
          key={file.path}
          style={{ paddingLeft: `${level * 16}px` }}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-sm cursor-pointer group",
            isActive && "bg-[var(--vscode-list-activeSelectionBackground)]",
            !isActive && "hover:bg-[var(--vscode-list-hoverBackground)]"
          )}
          onClick={() => handleClick(node, file.path)}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(file.path)}
          />
          <span
            className={cn(
              STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
              isActive && "text-inherit"
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
                  isActive && "text-inherit"
                )}
              >
                −{file.deletions}
              </span>
            )}
          </div>
        </div>
      );
    }

    const isExpanded = expandedDirs.has(node.path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path || "root"}>
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
                  isExpanded ? "codicon-chevron-down" : "codicon-chevron-right"
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
        {isExpanded &&
          node.children?.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return <div className="flex flex-col">{renderTreeNode(fileTree)}</div>;
};
