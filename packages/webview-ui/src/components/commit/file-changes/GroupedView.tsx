import { Checkbox } from "@/components/common/Checkbox";
import { cn } from "@/lib/utils";
import type { FileChange } from "@/state/types";

import React from "react";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FileItem } from "./FileItem";
import { FileStatus } from "@yaac/shared";

export interface GroupedViewProps {
  groupedFiles: Record<FileStatus, FileChange[]>;
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  hasOpenedFile: boolean;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string, metaKey: boolean) => void;
  onGroupSelect?: (files: FileChange[], checked: boolean) => void;
}

export const GroupedView: React.FC<GroupedViewProps> = ({
  groupedFiles,
  selectedFiles,
  selectedPath,
  searchQuery,
  hasOpenedFile,
  onSelect,
  onFileClick,
  onGroupSelect,
}) => {
  const renderFileGroup = (status: FileStatus) => {
    const files = groupedFiles[status];
    if (files.length === 0) return null;

    return (
      <div key={status} className="flex flex-col">
        <div className="flex items-center h-[22px] px-2 group">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-8 h-full">
              <Checkbox
                checked={files.every((file: FileChange) =>
                  selectedFiles.includes(file.path)
                )}
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
              {STATUS_LABELS[status]}
              <span className="text-[11px] opacity-80">({files.length})</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          {files.map((file: FileChange) => (
            <div key={file.path} className="pl-[40px]">
              <FileItem
                file={file}
                isSelected={selectedFiles.includes(file.path)}
                isActive={file.path === selectedPath}
                hasOpenedFile={hasOpenedFile}
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
      {(Object.keys(groupedFiles) as FileStatus[]).map((status) =>
        renderFileGroup(status)
      )}
    </div>
  );
};
