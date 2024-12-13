import React from "react";
import { cn } from "@/lib/utils";
import { HighlightText } from "../../common/HighlightText";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from "./constants";
import type { FileChange } from "@yaac/shared";
import { Checkbox } from "../../common/Checkbox";
import { logger } from "@/lib/logger";
import { useAtom } from "jotai";
import { viewModeAtom } from "@/state/atoms/ui";
import { basename } from "@/utils/path";

interface FileItemProps {
  file: FileChange;
  isSelected: boolean;
  isActive: boolean;
  hasOpenedFile: boolean;
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
  const [viewMode] = useAtom(viewModeAtom);

  const handleCheckboxChange = () => {
    onSelect?.(file.path);

    if (isSelected && isActive) {
      onClick?.(file.path, false);
    } else if (!isSelected && !hasOpenedFile) {
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
          <div className="flex items-center gap-0.5 w-8">
            <span
              className={cn(
                "font-mono font-medium text-[12px]",
                STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                isActive && "text-inherit"
              )}
              title={STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]}
            >
              {STATUS_LETTERS[file.status as keyof typeof STATUS_LETTERS]}
            </span>
          </div>

          <span className="truncate">
            <HighlightText 
              text={viewMode === "tree" ? basename(file.path) : file.path} 
              highlight={searchQuery} 
            />
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
