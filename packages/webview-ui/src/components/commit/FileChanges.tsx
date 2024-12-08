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

// File change status icons (使用 VSCode Codicons)
const STATUS_ICONS = {
  added: "add",
  modified: "edit",
  deleted: "trash",
  renamed: "arrow-right",
  default: "file",
} as const;

// File change status labels
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

  const handleFileClick = (path: string) => {
    if (path === selectedPath) {
      // 如果点击的是已选中的文件，取消选中并关闭 diff
      selectFile("");
      setShowDiff(false);
    } else {
      // 如果点击的是未选中的文件，选中并显示 diff
      selectFile(path);
      setShowDiff(true);
    }
    if (onFileSelect) {
      onFileSelect(path);
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
        <div className="flex items-center justify-between group h-[22px] px-2">
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
                  "group flex items-center h-[22px] px-2 cursor-pointer select-none",
                  "hover:bg-[var(--vscode-list-hoverBackground)]",
                  isActive &&
                    "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
                )}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    onFileSelect?.(file.path);
                  } else {
                    handleFileClick(file.path);
                  }
                }}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <label
                    className="flex items-center justify-center w-4 h-4 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="w-3 h-3"
                      checked={isSelected}
                      onChange={() => onFileSelect?.(file.path)}
                    />
                  </label>
                  <span className="flex items-center gap-1.5 truncate text-[13px]">
                    <span className="truncate">
                      <HighlightText text={file.path} highlight={searchQuery} />
                    </span>
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 pl-2 text-[12px] tabular-nums",
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

  const renderFlatList = () => {
    return (
      <div className="flex flex-col gap-4 p-2">
        {filteredFiles.map((file) => {
          const isSelected = selectedFiles.includes(file.path);
          const isActive = file.path === selectedPath;
          return (
            <div
              key={file.path}
              className={cn(
                "group flex items-center h-[22px] px-2 cursor-pointer select-none",
                "hover:bg-[var(--vscode-list-hoverBackground)]",
                isActive &&
                  "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
              )}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  onFileSelect?.(file.path);
                } else {
                  handleFileClick(file.path);
                }
              }}
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <label
                  className="flex items-center justify-center w-4 h-4 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="w-3 h-3"
                    checked={isSelected}
                    onChange={() => onFileSelect?.(file.path)}
                  />
                </label>
                <span className="flex items-center gap-1.5 truncate text-[13px]">
                  <i
                    className={cn(
                      `codicon codicon-${
                        STATUS_ICONS[file.status]
                      } text-[14px]`,
                      STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                      isActive && "text-inherit"
                    )}
                  />
                  <span className="truncate">
                    <HighlightText text={file.path} highlight={searchQuery} />
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 pl-2 text-[12px] tabular-nums",
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

  const renderFlatView = () => {
    return (
      <div className="flex flex-col gap-4 p-2">
        {filteredFiles.map((file) => {
          const isSelected = selectedFiles.includes(file.path);
          const isActive = file.path === selectedPath;
          return (
            <div
              key={file.path}
              className={cn(
                "group flex items-center h-[22px] px-2 cursor-pointer select-none",
                "hover:bg-[var(--vscode-list-hoverBackground)]",
                isActive &&
                  "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
              )}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  onFileSelect?.(file.path);
                } else {
                  handleFileClick(file.path);
                }
              }}
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <label
                  className="flex items-center justify-center w-4 h-4 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="w-3 h-3"
                    checked={isSelected}
                    onChange={() => onFileSelect?.(file.path)}
                  />
                </label>
                <span className="flex items-center gap-1.5 truncate text-[13px]">
                  <i
                    className={cn(
                      `codicon codicon-${
                        STATUS_ICONS[file.status]
                      } text-[14px]`,
                      STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                      isActive && "text-inherit"
                    )}
                  />
                  <span className="truncate">
                    <HighlightText text={file.path} highlight={searchQuery} />
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 pl-2 text-[12px] tabular-nums",
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
        <div className="flex items-center gap-2 px-2 py-1.5 sticky top-0 z-10 bg-[var(--vscode-editor-background)]">
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
          {viewMode === "tree" && <div>Tree view coming soon...</div>}
        </div>
      </Section.Content>

      {showDiff && <DiffViewer />}
    </Section>
  );
};
