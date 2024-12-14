import React from "react";
import { cn } from "@/lib/utils";
import { HighlightText } from "@/components/common/HighlightText";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS, VIEW_MODES } from "./constants";
import { GitFileChange } from "@yaac/shared";
import { Checkbox } from "../../common/Checkbox";
import { basename } from "path";

interface FileItemProps {
  file: GitFileChange;
  selected: boolean;
  isOpen: boolean;
  viewMode: string;
  searchQuery?: string;
  onSelect: (path: string) => void;
  onClick: (path: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  selected,
  isOpen,
  viewMode,
  searchQuery = "",
  onSelect,
  onClick,
}) => {
  const handleSelect = () => {
    onSelect(file.path);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(file.path);
  };

  return (
    <div
      className={cn(
        "group flex items-center h-[32px] select-none",
        selected
          ? "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)]"
          : "hover:bg-[var(--vscode-list-hoverBackground)]"
      )}
      onClick={handleClick}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <div className="flex items-center justify-center w-8 h-full">
          <Checkbox
            checked={selected}
            onChange={handleSelect}
          />
        </div>

        <div className="flex-1 flex items-center gap-2 truncate text-[13px] pl-1 pr-2">
          <div className="flex items-center gap-0.5">
            <span
              className={cn(
                "font-mono font-medium text-[12px]",
                STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                selected && "text-inherit"
              )}
              title={STATUS_LABELS[file.status as keyof typeof STATUS_LABELS]}
            >
              {STATUS_LETTERS[file.status as keyof typeof STATUS_LETTERS]}
            </span>
          </div>

          <span className="truncate">
            <HighlightText
              text={viewMode === VIEW_MODES.GROUPED ? basename(file.path) : file.path}
              highlight={searchQuery}
            />
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 px-2 text-[12px] tabular-nums",
          !selected && "text-[var(--vscode-descriptionForeground)]"
        )}
      >
        {file.additions > 0 && (
          <span className={cn("text-git-added-fg", selected && "text-inherit")}>
            +{file.additions}
          </span>
        )}
        {file.deletions > 0 && (
          <span
            className={cn("text-git-deleted-fg", selected && "text-inherit")}
          >
            −{file.deletions}
          </span>
        )}
      </div>
    </div>
  );
};
