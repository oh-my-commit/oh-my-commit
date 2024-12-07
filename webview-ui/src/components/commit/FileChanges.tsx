import React, { useMemo } from "react";
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
  added: "#89D185",    // VSCode git colors
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

  // 按状态分组的文件
  const groupedFiles = useMemo(() => {
    const groups = {
      added: [] as FileChange[],
      modified: [] as FileChange[],
      deleted: [] as FileChange[],
      renamed: [] as FileChange[],
    };
    
    files.forEach(file => {
      const status = file.status as keyof typeof groups;
      if (status in groups) {
        groups[status].push(file);
      }
    });
    
    return groups;
  }, [files]);

  const handleFileClick = (path: string) => {
    selectFile(path);
    onFileSelect?.(path);
  };

  const renderFileGroup = (status: keyof typeof STATUS_COLORS, files: FileChange[]) => {
    if (files.length === 0) return null;

    return (
      <div key={status}>
        <div className="h-[22px] flex items-center gap-2 px-2">
          <vscode-icon 
            name={STATUS_ICONS[status] || STATUS_ICONS.default}
            style={{ color: STATUS_COLORS[status] }}
          />
          <span className="text-[12px] font-medium text-[var(--vscode-foreground)]">
            {STATUS_LABELS[status]} ({files.length})
          </span>
        </div>
        {files.map(file => {
          const isSelected = file.path === selectedPath;
          return (
            <div
              key={file.path}
              className={`
                h-[22px] flex items-center px-3 cursor-pointer
                hover:bg-[var(--vscode-list-hoverBackground)]
                ${isSelected ? 'bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]' : ''}
              `}
              onClick={() => handleFileClick(file.path)}
              title={file.path}
            >
              <span className="flex-1 truncate text-[12px]">{file.path}</span>
              <div className="flex items-center gap-2 text-[12px]">
                {file.additions > 0 && (
                  <span style={{ color: STATUS_COLORS.added }}>+{file.additions}</span>
                )}
                {file.deletions > 0 && (
                  <span style={{ color: STATUS_COLORS.deleted }}>-{file.deletions}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex min-h-0 bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)]">
      {/* 文件列表面板 */}
      <div className="w-[280px] flex flex-col overflow-y-auto border-r border-[var(--vscode-panel-border)]">
        <div className="flex-none h-[28px] flex items-center justify-between px-2 border-b border-[var(--vscode-panel-border)]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium">Changes</span>
            <div className="flex items-center gap-1 text-[12px]">
              <span style={{ color: STATUS_COLORS.added }}>+{stats.additions}</span>
              <span style={{ color: STATUS_COLORS.deleted }}>-{stats.deletions}</span>
              <span className="text-[var(--vscode-descriptionForeground)]">
                {files.length} files
              </span>
            </div>
          </div>
          <VSCodeButton
            appearance="icon"
            title="Refresh Changes"
            onClick={() => {/* TODO: 实现刷新功能 */}}
          >
            <span className="codicon codicon-refresh" />
          </VSCodeButton>
        </div>

        <div className="flex-1 py-1">
          {Object.entries(groupedFiles).map(([status, files]) => 
            renderFileGroup(status as keyof typeof STATUS_COLORS, files)
          )}
        </div>
      </div>

      {/* 差异查看器面板 */}
      <div className="flex-1 overflow-y-auto">
        {selectedPath ? (
          showDiff && <DiffViewer />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--vscode-descriptionForeground)]">
            <vscode-icon name="git-compare" className="text-[24px] opacity-50" />
            <span className="text-[12px]">Select a file to view changes</span>
          </div>
        )}
      </div>
    </div>
  );
};
