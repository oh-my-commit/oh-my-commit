import { cn } from "@/lib/utils";
import { GitChangeType, GitFileChange } from "@oh-my-commits/shared/common";
import React from "react";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FileItem } from "./FileItem";

export interface GroupedViewProps {
  files: GitFileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  onSelect: (path: string) => void;
  onFileClick: (path: string) => void;
}

export const GroupedView: React.FC<GroupedViewProps> = ({
  files,
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onFileClick,
}) => {
  // 按状态分组文件
  const groupedFiles = React.useMemo(() => {
    const groups = new Map<GitChangeType, GitFileChange[]>();

    files.forEach((file) => {
      const status = file.status;
      if (!groups.has(status)) {
        groups.set(status, []);
      }
      groups.get(status)?.push(file);
    });

    return groups;
  }, [files]);

  return (
    <div className="flex flex-col gap-2">
      {Array.from(groupedFiles.entries()).map(([status, files]) => (
        <div key={status} className="flex flex-col">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 text-[12px] font-medium",
              STATUS_COLORS[status]
            )}
          >
            <span>{STATUS_LABELS[status]}</span>
            <span className="text-[11px] text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="flex flex-col">
            {files.map((file) => (
              <FileItem
                key={file.path}
                file={file}
                selected={selectedFiles.includes(file.path)}
                isOpen={selectedPath === file.path}
                searchQuery={searchQuery}
                onSelect={onSelect}
                onClick={onFileClick}
                viewMode="grouped"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
