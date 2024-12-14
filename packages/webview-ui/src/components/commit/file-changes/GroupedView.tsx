import { cn } from "@/lib/utils";
import React from "react";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FileItem } from "./FileItem";
import { GitFileChange, GitFileStatus } from "@yaac/shared";

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
  // Group files by status
  const groupedFiles = React.useMemo(() => {
    const groups: Record<GitFileStatus, GitFileChange[]> = {
      untracked: [],
      modified: [],
      deleted: [],
      renamed: [],
      copied: [],
      unmerged: [],
    };

    files.forEach((file) => {
      groups[file.status].push(file);
    });

    return groups;
  }, [files]);

  const renderFileGroup = (status: GitFileStatus) => {
    const files = groupedFiles[status];
    if (files.length === 0) return null;

    return (
      <div key={status} className="mb-4">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium",
            STATUS_COLORS[status],
          )}
        >
          <span>{STATUS_LABELS[status]}</span>
          <span className="text-[var(--vscode-descriptionForeground)]">
            ({files.length})
          </span>
        </div>

        <div className="space-y-0.5">
          {files.map((file) => (
            <FileItem
              key={file.path}
              file={file}
              selected={selectedFiles.includes(file.path)}
              isOpen={selectedPath === file.path}
              viewMode="grouped"
              searchQuery={searchQuery}
              onClick={() => onFileClick(file.path)}
              onSelect={() => onSelect(file.path)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {(Object.keys(groupedFiles) as GitFileStatus[]).map((status) =>
        renderFileGroup(status)
      )}
    </div>
  );
};
