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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { cn } from "../../lib/utils";
import { HighlightText } from "../common/HighlightText";

interface FileChangesProps {
  files: FileChange[];
  selectedFiles: string[];
  setState: (update: Partial<CommitState>) => void;
  onFileSelect?: (path: string) => void;
}

// File change status colors
const STATUS_COLORS = {
  added: "text-vscode-gitDecoration-addedResourceForeground", // Git decoration colors
  modified: "text-vscode-gitDecoration-modifiedResourceForeground",
  deleted: "text-vscode-gitDecoration-deletedResourceForeground",
  renamed: "text-vscode-gitDecoration-renamedResourceForeground",
  default: "text-vscode-gitDecoration-modifiedResourceForeground",
} as const;

// File change status icons
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
  grouped: "Grouped",
  tree: "Tree",
  flat: "Flat",
} as const;

export const FileChanges: React.FC<FileChangesProps> = ({
  files,
  selectedFiles,
  setState,
  onFileSelect,
}) => {
  const [stats] = useAtom(commitStatsAtom);
  const [selectedPath] = useAtom(selectedFileAtom);
  const [showDiff] = useAtom(showDiffAtom);
  const [, selectFile] = useAtom(selectFileAtom);
  const [, updateCommitState] = useAtom(updateCommitStateAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [viewMode, setViewMode] =
    React.useState<keyof typeof VIEW_MODES>("grouped");
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
    selectFile(path);
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
      <div key={status} className="group">
        <div
          className={cn(
            "h-[22px] flex items-center gap-1 px-[10px] select-none",
            "text-[11px] opacity-80",
            "hover:opacity-100"
          )}
        >
          {/* <span
            className={`codicon codicon-${STATUS_ICONS[status]} text-[14px]`}
            style={{ color: STATUS_COLORS[status] }}
          /> */}
          <span className="font-medium uppercase tracking-wide">
            {STATUS_LABELS[status]}
          </span>
          <span className="opacity-80">({files.length})</span>
        </div>
        <div className="mb-1">
          {files.map((file) => {
            const isSelected = file.path === selectedPath;
            return (
              <div
                key={file.path}
                className={cn(
                  "group relative h-[22px] flex items-center pr-2 pl-6",
                  "hover:bg-vscode-list-hoverBackground",
                  isSelected &&
                    "bg-vscode-list-activeSelectionBackground/50 text-vscode-list-activeSelectionForeground"
                )}
                onClick={() => handleFileClick(file.path)}
                title={file.path}
              >
                <span className="flex-1 truncate text-[13px] leading-[22px] cursor-pointer">
                  <HighlightText
                    text={file.path.split("/").pop() || ""}
                    highlight={searchQuery}
                  />
                </span>
                <div
                  className={cn(
                    "flex items-center gap-2 pl-2 text-[12px] tabular-nums",
                    isSelected && "text-vscode-list-activeSelectionForeground"
                  )}
                >
                  {file.additions > 0 && (
                    <span
                      className={cn(
                        isSelected
                          ? ""
                          : "text-vscode-gitDecoration-addedResourceForeground"
                      )}
                    >
                      +{file.additions}
                    </span>
                  )}
                  {file.deletions > 0 && (
                    <span
                      className={cn(
                        isSelected
                          ? ""
                          : "text-vscode-gitDecoration-deletedResourceForeground"
                      )}
                    >
                      -{file.deletions}
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
      <div>
        {filteredFiles.map((file) => {
          const isSelected = file.path === selectedPath;
          return (
            <div
              key={file.path}
              className={cn(
                "group relative h-[22px] flex items-center pl-[30px] pr-2",
                "hover:bg-vscode-list-hoverBackground",
                isSelected &&
                  "bg-vscode-list-activeSelectionBackground text-vscode-list-activeSelectionForeground"
              )}
              onClick={() => handleFileClick(file.path)}
              title={file.path}
            >
              <span className="flex-1 truncate text-[13px] leading-[22px] cursor-pointer">
                <HighlightText
                  text={file.path.split("/").pop() || ""}
                  highlight={searchQuery}
                />
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 pl-2 text-[12px] tabular-nums",
                  isSelected && "text-vscode-list-activeSelectionForeground"
                )}
              >
                {file.additions > 0 && (
                  <span
                    className={cn(
                      isSelected
                        ? ""
                        : "text-vscode-gitDecoration-addedResourceForeground"
                    )}
                  >
                    +{file.additions}
                  </span>
                )}
                {file.deletions > 0 && (
                  <span
                    className={cn(
                      isSelected
                        ? ""
                        : "text-vscode-gitDecoration-deletedResourceForeground"
                    )}
                  >
                    -{file.deletions}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "absolute left-[10px] w-[16px] h-[16px] flex items-center justify-center",
                  isSelected
                    ? "text-vscode-list-activeSelectionForeground"
                    : STATUS_COLORS[file.status]
                )}
              >
                <span
                  className={`codicon codicon-${
                    STATUS_ICONS[file.status]
                  } text-[14px]`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex min-h-0 bg-vscode-sideBar-background">
      {/* 文件列表面板 */}
      <div className="w-[300px] shrink-0 flex flex-col overflow-y-auto border-r border-vscode-panel-border">
        <div className="flex-none h-[35px] flex items-center justify-between px-[10px] select-none">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-vscode-sideBarTitle-foreground">
              Changed Files
            </span>
            <span className="text-[11px] opacity-80">
              ({filteredFiles.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <VSCodeButton
              appearance="icon"
              title="Switch View Mode"
              onClick={() => {
                const modes = Object.keys(
                  VIEW_MODES
                ) as (keyof typeof VIEW_MODES)[];
                const currentIndex = modes.indexOf(viewMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setViewMode(modes[nextIndex]);
              }}
            >
              <span
                className={cn(
                  "codicon",
                  viewMode === "grouped"
                    ? "codicon-list-flat"
                    : viewMode === "tree"
                    ? "codicon-list-tree"
                    : "codicon-list-selection"
                )}
              />
            </VSCodeButton>
          </div>
        </div>

        <div className="flex-none h-[30px] px-[10px] flex items-center border-b border-vscode-panel-border">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              className="
                  file-search-input w-full h-[24px] px-[6px] pl-[24px]
                  bg-vscode-input-background
                  text-vscode-input-foreground
                  border border-vscode-input-border
                  rounded-[2px] text-[12px]
                  focus:outline-none
                  focus:border-vscode-focusBorder
                  placeholder:text-vscode-input-placeholderForeground
                "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search files"
              spellCheck={false}
            />
            <span className="absolute top-1/2 -translate-y-1/2 left-[6px] text-vscode-input-placeholderForeground codicon codicon-search text-[12px]"></span>
            {searchQuery && (
              <VSCodeButton
                appearance="icon"
                className="absolute right-[2px]"
                onClick={() => setSearchQuery("")}
              >
                <span className="codicon codicon-close text-[14px]" />
              </VSCodeButton>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === "grouped" && (
            <>
              {renderFileGroup("added", groupedFiles.added)}
              {renderFileGroup("modified", groupedFiles.modified)}
              {renderFileGroup("deleted", groupedFiles.deleted)}
              {renderFileGroup("renamed", groupedFiles.renamed)}
            </>
          )}
          {viewMode === "flat" && renderFlatList()}
        </div>
      </div>

      {/* 差异查看器面板 */}
      {showDiff && <DiffViewer />}
    </div>
  );
};
