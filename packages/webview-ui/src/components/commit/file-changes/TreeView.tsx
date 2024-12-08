import React from 'react';
import { cn } from '../../../lib/utils';
import { HighlightText } from '../../common/HighlightText';
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from './constants';
import type { FileChange } from '../../../state/types';

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: TreeNode[];
  file?: FileChange;
}

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
  searchQuery = '',
  onSelect,
  onFileClick,
}) => {
  const [expandedDirs, setExpandedDirs] = React.useState<Set<string>>(new Set(['']));

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    if (node.type === "file" && node.file) {
      const file = node.file;
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
          onClick={() => onFileClick?.(file.path)}
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
            <HighlightText text={node.name} highlight={searchQuery} />
          </span>
          <div className="flex items-center gap-1 text-xs opacity-60">
            {file.additions > 0 && (
              <span
                className={cn(
                  "text-git-added-fg",
                  isActive && "text-inherit"
                )}
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
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.path || "root"}>
        {(node.path || level > 0) && (
          <div
            style={{ paddingLeft: `${level * 16}px` }}
            className="flex items-center gap-2 px-2 py-1 text-[var(--vscode-descriptionForeground)] cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)] rounded-sm"
            onClick={() => toggleDir(node.path)}
          >
            {hasChildren && (
              <i className={cn(
                "codicon",
                isExpanded ? "codicon-chevron-down" : "codicon-chevron-right"
              )} />
            )}
            <i className="codicon codicon-folder" />
            <span className="truncate">{node.name || "/"}</span>
            {hasChildren && (
              <span className="ml-1 text-xs opacity-60">
                ({node.children.length})
              </span>
            )}
          </div>
        )}
        {isExpanded && node.children.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderTreeNode(fileTree)}
    </div>
  );
};
