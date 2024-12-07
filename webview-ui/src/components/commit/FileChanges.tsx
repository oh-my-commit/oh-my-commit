import React, { useMemo, useState } from "react";
import { useAtom } from "jotai";
import {
  commitFilesAtom,
  commitStatsAtom,
} from "../../state/atoms/commit-core";
import {
  selectFileAtom,
  selectedFileAtom,
  showDiffAtom,
} from "../../state/atoms/commit-ui";
import { DiffViewer } from "./DiffViewer";
import type { FileChange } from "../../state/types";
import type { CommitState } from "../../types/commit-state";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface FileChangesProps {
  files: FileChange[];
  selectedFiles: string[];
  setState: (update: Partial<CommitState>) => void;
  onFileSelect?: (path: string) => void;
}

// 文件变更类型的颜色映射
const STATUS_COLORS = {
  added: "#89D185", // VSCode git colors
  modified: "#E2C08D",
  deleted: "#F14C4C",
  renamed: "#569CD6",
  default: "var(--vscode-foreground)",
} as const;

// 文件变更类型的图标映射
const STATUS_ICONS = {
  added: "add",
  modified: "edit",
  deleted: "trash",
  renamed: "arrow-right",
  default: "file",
} as const;

// 文件变更类型的标签映射
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
  const [viewMode, setViewMode] =
    React.useState<keyof typeof VIEW_MODES>("grouped");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  // 过滤文件
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.path.toLowerCase().includes(query));
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
    onFileSelect?.(path);
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
          className="
            h-[22px] flex items-center gap-1 px-[10px] select-none
            text-[11px] text-[var(--vscode-foreground)] opacity-80
            hover:opacity-100
          "
        >
          <vscode-icon
            name={STATUS_ICONS[status] || STATUS_ICONS.default}
            style={{ color: STATUS_COLORS[status] }}
            className="text-[14px]"
          />
          <span className="font-medium uppercase tracking-wide">
            {STATUS_LABELS[status]}
          </span>
          <span className="opacity-80">({files.length})</span>
        </div>
        <div className="mb-1">
          {files.map((file) => {
            const isSelected = file.path === selectedPath;
            const hasChanges = file.additions > 0 || file.deletions > 0;

            return (
              <div
                key={file.path}
                className={`
                  group relative h-[22px] flex items-center pl-[30px] pr-2
                  hover:bg-[var(--vscode-list-hoverBackground)]
                  ${
                    isSelected
                      ? "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
                      : ""
                  }
                `}
                onClick={() => handleFileClick(file.path)}
                title={file.path}
              >
                <span className="flex-1 truncate text-[13px] leading-[22px] cursor-pointer">
                  {file.path.split("/").pop()}
                </span>
                {hasChanges && (
                  <div
                    className={`
                      hidden group-hover:flex items-center gap-2 pl-2 text-[12px] tabular-nums
                      ${
                        isSelected
                          ? "text-[var(--vscode-list-activeSelectionForeground)]"
                          : ""
                      }
                    `}
                  >
                    {file.additions > 0 && (
                      <span
                        className={
                          isSelected
                            ? ""
                            : "text-[var(--vscode-gitDecoration-addedResourceForeground)]"
                        }
                      >
                        +{file.additions}
                      </span>
                    )}
                    {file.deletions > 0 && (
                      <span
                        className={
                          isSelected
                            ? ""
                            : "text-[var(--vscode-gitDecoration-deletedResourceForeground)]"
                        }
                      >
                        -{file.deletions}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`
                    absolute left-[10px] w-[16px] h-[16px] flex items-center justify-center
                    ${
                      isSelected
                        ? "text-[var(--vscode-list-activeSelectionForeground)]"
                        : `text-[${STATUS_COLORS[status]}]`
                    }
                  `}
                >
                  <vscode-icon
                    name={STATUS_ICONS[status]}
                    className="text-[14px]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex min-h-0 bg-[var(--vscode-sideBar-background)]">
      {/* 文件列表面板 */}
      <div className="w-[300px] flex flex-col overflow-y-auto border-r border-[var(--vscode-panel-border)]">
        <div className="flex-none h-[35px] flex items-center justify-between px-[10px] select-none">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--vscode-sideBarTitle-foreground)]">
              Changed Files
            </span>
            <span className="text-[11px] opacity-80">
              ({filteredFiles.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <VSCodeButton
              appearance="icon"
              title="Search files"
              onClick={toggleSearch}
            >
              <span
                className={`codicon codicon-search ${
                  isSearching
                    ? "text-[var(--vscode-inputOption-activeForeground)]"
                    : ""
                }`}
              />
            </VSCodeButton>
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
              {/* <span
                className={`codicon codicon-${
                  viewMode === "grouped"
                    ? "list-flat"
                    : viewMode === "tree"
                    ? "list-tree"
                    : "list-selection"
                }`}
              /> */}
              <span className="codicon codicon-list-flat" />
            </VSCodeButton>
          </div>
        </div>

        {isSearching && (
          <div className="flex-none h-[30px] px-[10px] flex items-center border-b border-[var(--vscode-panel-border)]">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                className="
                  file-search-input w-full h-[24px] px-[6px] pl-[24px]
                  bg-[var(--vscode-input-background)]
                  text-[var(--vscode-input-foreground)]
                  border border-[var(--vscode-input-border)]
                  rounded-[2px] text-[12px]
                  focus:outline-none
                  focus:border-[var(--vscode-focusBorder)]
                  placeholder:text-[var(--vscode-input-placeholderForeground)]
                "
                placeholder="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <span className="absolute left-[6px] text-[var(--vscode-input-placeholderForeground)]">
                <span className="codicon codicon-search text-[12px]" />
              </span>
              {searchQuery && (
                <span
                  className="absolute right-[6px] cursor-pointer text-[var(--vscode-input-placeholderForeground)] hover:text-[var(--vscode-input-foreground)]"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="codicon codicon-close text-[12px]" />
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 py-1">
          {viewMode === "grouped" &&
            Object.entries(groupedFiles).map(([status, files]) =>
              renderFileGroup(status as keyof typeof STATUS_COLORS, files)
            )}
          {filteredFiles.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center h-[100px] text-[var(--vscode-descriptionForeground)]">
              <span className="codicon codicon-search text-[24px] mb-2 opacity-50" />
              <span className="text-[12px]">No matching files</span>
            </div>
          )}
        </div>
      </div>

      {/* 差异查看器面板 */}
      <div className="flex-1 overflow-y-auto">
        {selectedPath ? (
          showDiff && <DiffViewer />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--vscode-descriptionForeground)]">
            <vscode-icon
              name="git-compare"
              className="text-[24px] opacity-50"
            />
            <span className="text-[12px]">Select a file to view changes</span>
          </div>
        )}
      </div>
    </div>
  );
};
