import React from "react";
import { cn } from "@/lib/utils";
import { HighlightText } from "../../common/HighlightText";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from "./constants";
import type { FileChange } from '@yaac/shared';
import { Checkbox } from "../../common/Checkbox";
import { logger } from "@/lib/logger";

interface FileItemProps {
  file: FileChange;
  isSelected: boolean;
  isActive: boolean;
  hasOpenedFile: boolean; // 是否有任何文件被打开
  searchQuery?: string;
  onSelect?: (path: string) => void;
  onClick?: (path: string, metaKey: boolean) => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  isSelected,
  isActive,
  hasOpenedFile,
  searchQuery = "",
  onSelect,
  onClick,
}) => {
  const handleCheckboxChange = () => {
    onSelect?.(file.path);

    if (isSelected && isActive) {
      // 如果文件当前是选中且打开的状态，取消选择时也关闭它
      onClick?.(file.path, false);
    } else if (!isSelected && !hasOpenedFile) {
      // 如果没有文件被打开，且当前文件未被选中，选中时也打开它
      onClick?.(file.path, false);
    }
  };

  logger.info("FileItem rendered:", file);

  return (
    <div
      className={cn(
        "group flex items-center h-[32px] select-none",
        isActive
          ? "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
          : "hover:bg-[var(--vscode-list-hoverBackground)]"
      )}
      onClick={(e) => onClick?.(file.path, e.metaKey || e.ctrlKey)}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <div className="flex items-center justify-center w-8 h-full">
          <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
        </div>
        <div className="flex-1 flex items-center gap-1.5 truncate text-[13px] pl-1 pr-2">
          <span
            className={cn(
              "font-mono font-medium text-[12px] w-4 text-center",
              STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
              isActive && "text-inherit"
            )}
            title={STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]}
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
          <span className={cn("text-git-added-fg", isActive && "text-inherit")}>
            +{file.additions}
          </span>
        )}
        {file.deletions > 0 && (
          <span
            className={cn("text-git-deleted-fg", isActive && "text-inherit")}
          >
            −{file.deletions}
          </span>
        )}
      </div>
    </div>
  );
};
