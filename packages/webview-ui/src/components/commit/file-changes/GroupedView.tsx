import React from "react";
import { cn } from "../../../lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FileItem } from "./FileItem";
import type { FileChange } from "../../../state/types";
import { Checkbox } from "../../common/Checkbox";

interface GroupedViewProps {
  groupedFiles: {
    added: FileChange[];
    modified: FileChange[];
    deleted: FileChange[];
    renamed: FileChange[];
  };
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string, metaKey: boolean) => void;
  onGroupSelect?: (files: FileChange[], selected: boolean) => void;
}

export const GroupedView: React.FC<GroupedViewProps> = ({
  groupedFiles,
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onFileClick,
  onGroupSelect,
}) => {
  const renderFileGroup = (
    status: keyof typeof STATUS_COLORS,
    files: FileChange[]
  ) => {
    if (files.length === 0) return null;

    return (
      <div key={status} className="flex flex-col">
        <div className="flex items-center h-[22px] px-2 group">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-8 h-full">
              <Checkbox
                checked={files.every((f) => selectedFiles.includes(f.path))}
                onChange={(checked) => onGroupSelect?.(files, checked)}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span
              className={cn(
                "flex items-center gap-1 text-[12px] font-medium cursor-default",
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
              onGroupSelect?.(files, !allSelected);
            }}
          >
            {files.every((f) => selectedFiles.includes(f.path))
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="flex flex-col">
          {files.map((file) => (
            <div key={file.path} className="pl-[40px]">
              <FileItem
                file={file}
                isSelected={selectedFiles.includes(file.path)}
                isActive={file.path === selectedPath}
                hasOpenedFile={!!selectedPath}
                searchQuery={searchQuery}
                onSelect={onSelect}
                onClick={onFileClick}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderFileGroup("added", groupedFiles.added)}
      {renderFileGroup("modified", groupedFiles.modified)}
      {renderFileGroup("deleted", groupedFiles.deleted)}
      {renderFileGroup("renamed", groupedFiles.renamed)}
    </div>
  );
};
