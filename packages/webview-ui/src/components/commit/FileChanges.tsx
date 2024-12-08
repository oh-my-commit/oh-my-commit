import React, { useMemo, useState } from "react";
import { useAtom } from "jotai";
import {
  commitFilesAtom,
  commitStatsAtom,
  updateCommitStateAtom,
} from "../../state/atoms/commit-core";
import {
  selectFileAtom,
  selectedFileAtom,
  showDiffAtom,
  searchQueryAtom,
} from "../../state/atoms/commit-ui";
import { DiffViewer } from "./DiffViewer";
import type { FileChange } from "../../state/types";
import type { CommitState } from "../../types/commit-state";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { cn } from "../../lib/utils";
import { HighlightText } from "../common/HighlightText";
import { Section } from "../layout/Section";

interface FileChangesProps {
  files: FileChange[];
  selectedFiles: string[];
  setState: (update: Partial<CommitState>) => void;
  onFileSelect?: (path: string) => void;
}

// File change status colors
const STATUS_COLORS = {
  added: "text-git-added-fg", // Git decoration colors
  modified: "text-git-modified-fg",
  deleted: "text-git-deleted-fg",
  renamed: "text-git-renamed-fg",
  default: "text-git-modified-fg",
} as const;

// File change status letters (Git-style)
const STATUS_LETTERS = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
  default: "?",
} as const;

// File change status labels (for tooltips)
const STATUS_LABELS = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
  default: "Unknown",
} as const;

// 视图模式
const VIEW_MODES = {
  flat: "Flat",
  grouped: "Group",
  tree: "Tree",
} as const;

export const FileChanges: React.FC<FileChangesProps> = ({
  files,
  selectedFiles,
  setState,
  onFileSelect,
}) => {
  const [stats] = useAtom(commitStatsAtom);
  const [selectedPath] = useAtom(selectedFileAtom);
  const [showDiff, setShowDiff] = useAtom(showDiffAtom);
  const [, selectFile] = useAtom(selectFileAtom);
  const [, updateCommitState] = useAtom(updateCommitStateAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [viewMode, setViewMode] =
    React.useState<keyof typeof VIEW_MODES>("flat");
  const [isSearching, setIsSearching] = React.useState(false);

  // 过滤文件
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => {
      // 搜索文件路径
      if (file.path.toLowerCase().includes(query)) return true;

      // 搜索文件内容
      if (file.content?.toLowerCase().includes(query)) return true;

      // 搜索旧文件内容（对于修改和删除的文件）
      if (file.oldContent?.toLowerCase().includes(query)) return true;

      // 搜索差异内容
      if (file.diff?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [files, searchQuery]);

  // 按状态分组的文件
  const groupedFiles = useMemo(() => {
    const groups = {
      added: [] as FileChange[],
      modified: [] as FileChange[],
      deleted: [] as FileChange[],
      renamed: [] as FileChange[],
    };

    filteredFiles.forEach((file) => {
      const status = file.status as keyof typeof groups;
      if (status in groups) {
        groups[status].push(file);
      }
    });

    return groups;
  }, [filteredFiles]);

  // Tree node type for file tree structure
  interface TreeNode {
    name: string;
    path: string;
    type: "file" | "directory";
    children: TreeNode[];
    file?: FileChange;
  }

  // Build tree structure from flat file list
  const fileTree = useMemo(() => {
    console.log('Building tree from files:', filteredFiles);
    
    const root: TreeNode = {
      name: "",
      path: "",
      type: "directory",
      children: [],
    };

    filteredFiles.forEach((file) => {
      const parts = file.path.split("/").filter(Boolean); // Remove empty strings
      let current = root;

      // Create directory nodes
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const path = parts.slice(0, i + 1).join("/");
        
        let node = current.children.find((n) => n.name === part);
        
        if (!node) {
          node = {
            name: part,
            path,
            type: "directory",
            children: [],
          };
          current.children.push(node);
        }
        
        current = node;
      }

      // Add file node
      const fileName = parts[parts.length - 1];
      const filePath = parts.join("/");
      current.children.push({
        name: fileName,
        path: filePath,
        type: "file",
        children: [],
        file,
      });
    });

    console.log('Built tree structure:', root);
    return root;
  }, [filteredFiles]);

  // Track expanded directories
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([""]));

  // Toggle directory expansion
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
    console.log('Rendering node:', { node, level });
    
    if (node.type === "file" && node.file) {
      const file = node.file;
      const isActive = selectedPath === file.path;
      const isSelected = selectedFiles.includes(file.path);
      const status = file.status || "default";

      return (
        <div
          key={file.path}
          style={{ paddingLeft: `${level * 16}px` }}
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-sm cursor-pointer group",
            isActive && "bg-[var(--vscode-list-activeSelectionBackground)]",
            !isActive && "hover:bg-[var(--vscode-list-hoverBackground)]"
          )}
          onClick={() => {
            selectFile(file.path);
            onFileSelect?.(file.path);
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              updateCommitState({
                selectedFiles: e.target.checked
                  ? [...selectedFiles, file.path]
                  : selectedFiles.filter((p) => p !== file.path),
              });
            }}
          />
          <span
            className={cn(
              STATUS_COLORS[status],
              isActive && "text-inherit"
            )}
            title={STATUS_LABELS[status]}
          >
            {STATUS_LETTERS[status]}
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

  const renderTreeView = () => {
    console.log('Rendering tree view with fileTree:', fileTree);
    return (
      <div className="flex flex-col">
        {renderTreeNode(fileTree)}
      </div>
    );
  };

  const handleFileClick = (path: string) => {
    if (path === selectedPath) {
      // 如果点击的是当前选中的文件，取消选中
      selectFile("");
      setShowDiff(false);
      onFileSelect?.(path); // 同步取消 checkbox 选中状态
    } else {
      // 如果点击的是其他文件，选中它
      selectFile(path);
      setShowDiff(true);
      if (!selectedFiles.includes(path)) {
        onFileSelect?.(path); // 同步选中 checkbox
      }
    }
  };

  const handleFileSelect = (path: string) => {
    if (path === selectedPath) {
      // 如果是当前选中的文件，切换其选择状态
      onFileSelect?.(path);
      selectFile("");
      setShowDiff(false);
    } else {
      // 如果是其他文件，直接选中并展开
      onFileSelect?.(path);
      selectFile(path);
      setShowDiff(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      setIsSearching(false);
    }
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>(".file-search-input")?.focus();
      }, 0);
    } else {
      setSearchQuery("");
    }
  };

  const renderFileGroup = (
    status: keyof typeof STATUS_COLORS,
    files: FileChange[]
  ) => {
    if (files.length === 0) return null;

    return (
      <div key={status} className="flex flex-col">
        <div className="flex items-center justify-between h-[22px] px-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 text-[12px] font-medium",
                STATUS_COLORS[status]
              )}
            >
              <span className="uppercase">{STATUS_LABELS[status]}</span>
              <span className="text-[var(--vscode-descriptionForeground)]">
                ({files.length})
              </span>
            </span>
          </div>
          <button
            className={cn(
              "px-2 py-0.5 text-[11px] rounded",
              "bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)]",
              "hover:bg-[var(--vscode-button-secondaryHoverBackground)]"
            )}
            onClick={() => {
              const allSelected = files.every((f) =>
                selectedFiles.includes(f.path)
              );
              const newSelectedFiles = allSelected
                ? selectedFiles.filter((p) => !files.some((f) => f.path === p))
                : [...new Set([...selectedFiles, ...files.map((f) => f.path)])];
              setState({ selectedFiles: newSelectedFiles });
            }}
          >
            {files.every((f) => selectedFiles.includes(f.path))
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="flex flex-col">
          {files.map((file) => {
            const isSelected = selectedFiles.includes(file.path);
            const isActive = file.path === selectedPath;
            return (
              <div
                key={file.path}
                className={cn(
                  "group flex items-center h-[22px] cursor-pointer select-none",
                  isActive
                    ? "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
                    : "hover:bg-[var(--vscode-list-hoverBackground)]"
                )}
              >
                <div
                  className="flex-1 flex items-center min-w-0 px-2 h-full"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey) {
                      onFileSelect?.(file.path);
                    } else {
                      handleFileClick(file.path);
                    }
                  }}
                >
                  <div
                    className="flex items-center justify-center w-6 h-full cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect?.(file.path);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="w-3 h-3"
                      checked={isSelected}
                      onChange={() => onFileSelect?.(file.path)}
                    />
                  </div>
                  <span className="flex items-center gap-1.5 truncate text-[13px] ml-1">
                    <span
                      className={cn(
                        "font-mono font-medium text-[12px] w-4 text-center",
                        STATUS_COLORS[
                          file.status as keyof typeof STATUS_COLORS
                        ],
                        isActive && "text-inherit"
                      )}
                      title={
                        STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]
                      }
                    >
                      {
                        STATUS_LETTERS[
                          file.status as keyof typeof STATUS_LETTERS
                        ]
                      }
                    </span>
                    <span className="truncate">
                      <HighlightText text={file.path} highlight={searchQuery} />
                    </span>
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 text-[12px] tabular-nums",
                    !isActive && "text-[var(--vscode-descriptionForeground)]"
                  )}
                >
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
          })}
        </div>
      </div>
    );
  };

  const renderFlatView = () => {
    return (
      <div className="flex flex-col gap-0 p-2">
        {filteredFiles.map((file) => {
          const isSelected = selectedFiles.includes(file.path);
          const isActive = file.path === selectedPath;

          // 确保 checkbox 状态与文件激活状态保持一致
          if (isActive && !isSelected) {
            onFileSelect?.(file.path);
          }

          return (
            <div
              key={file.path}
              className={cn(
                "group flex items-center h-[32px] select-none",
                isActive
                  ? "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
                  : "hover:bg-[var(--vscode-list-hoverBackground)]"
              )}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  handleFileSelect(file.path);
                } else {
                  handleFileClick(file.path);
                }
              }}
            >
              <div className="flex-1 flex items-center min-w-0 h-full">
                <div className="flex items-center justify-center w-8 h-full">
                  <div className="w-3 h-3 relative">
                    <input
                      type="checkbox"
                      className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
                      checked={isSelected}
                      readOnly
                    />
                    <div
                      className={cn(
                        "absolute inset-0 border rounded",
                        "border-[var(--vscode-checkbox-border)]",
                        isSelected &&
                          "bg-[var(--vscode-checkbox-background)] border-[var(--vscode-checkbox-foreground)]"
                      )}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center text-[var(--vscode-checkbox-foreground)]">
                        <svg
                          className="w-2 h-2"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-1.5 truncate text-[13px] pl-1 pr-2">
                  <span
                    className={cn(
                      "font-mono font-medium text-[12px] w-4 text-center",
                      STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                      isActive && "text-inherit"
                    )}
                    title={
                      STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]
                    }
                  >
                    {STATUS_LETTERS[file.status as keyof typeof STATUS_LETTERS]}
                  </span>
                  <span className="truncate">
                    <HighlightText text={file.path} highlight={searchQuery} />
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 px-2 text-[12px] tabular-nums",
                  !isActive && "text-[var(--vscode-descriptionForeground)]"
                )}
              >
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
        })}
      </div>
    );
  };

  const renderGroupedView = () => {
    return (
      <div className="flex flex-col">
        {renderFileGroup("added", groupedFiles.added)}
        {renderFileGroup("modified", groupedFiles.modified)}
        {renderFileGroup("deleted", groupedFiles.deleted)}
        {renderFileGroup("renamed", groupedFiles.renamed)}
      </div>
    );
  };

  return (
    <Section title="Changed Files">
      <Section.Content>
        <div className="flex items-center gap-2 px-2 py-1.5 sticky top-0 z-10 ">
          <div className="relative flex-1 flex items-center">
            <i className="codicon codicon-search absolute left-2 translate-y-[2px] text-[12px] opacity-50 pointer-events-none z-10" />
            <style>
              {`
                .search-input::part(control) {
                  padding-left: 24px !important;
                }
              `}
            </style>
            <VSCodeTextField
              className="w-full search-input"
              placeholder="Filter"
              value={searchQuery}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                setSearchQuery(target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--vscode-descriptionForeground)]">
            <span>{Object.values(stats).reduce((a, b) => a + b, 0)} files</span>
            <span>·</span>
            <span className="text-[var(--vscode-gitDecoration-addedResourceForeground)]">
              +{stats.added}
            </span>
            <span>·</span>
            <span className="text-[var(--vscode-gitDecoration-deletedResourceForeground)]">
              -{stats.deleted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <button
            className={cn(
              "px-2 py-1 text-xs rounded-sm",
              viewMode === "flat"
                ? "bg-[var(--vscode-toolbar-activeBackground)]"
                : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
            )}
            onClick={() => setViewMode("flat")}
          >
            Flat
          </button>
          <button
            className={cn(
              "px-2 py-1 text-xs rounded-sm",
              viewMode === "grouped"
                ? "bg-[var(--vscode-toolbar-activeBackground)]"
                : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
            )}
            onClick={() => setViewMode("grouped")}
          >
            Grouped
          </button>
          <button
            className={cn(
              "px-2 py-1 text-xs rounded-sm",
              viewMode === "tree"
                ? "bg-[var(--vscode-toolbar-activeBackground)]"
                : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
            )}
            onClick={() => setViewMode("tree")}
          >
            Tree
          </button>
        </div>

        <div className="flex-1 overflow-auto px-2">
          {viewMode === "flat" && renderFlatView()}
          {viewMode === "grouped" && renderGroupedView()}
          {viewMode === "tree" && renderTreeView()}
        </div>
      </Section.Content>

      {showDiff && <DiffViewer />}
    </Section>
  );
};
