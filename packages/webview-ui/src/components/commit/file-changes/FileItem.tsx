import { HighlightText } from "@/components/common/HighlightText";
import { cn } from "@/lib/utils";
import { GitFileChange } from "@oh-my-commits/shared/common";

import React, { useEffect } from "react";
import { Checkbox } from "../../common/Checkbox";
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from "./constants";
import { basename } from "@/utils/path";

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
  const [pathMatchCount, setPathMatchCount] = React.useState(0);
  const [contentMatchCount, setContentMatchCount] = React.useState(0);

  const handleSelect = () => {
    onSelect(file.path);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(file.path);
  };

  // 检查文件内容中的匹配
  useEffect(() => {
    if (!searchQuery || !file.diff) {
      setContentMatchCount(0);
      return;
    }

    const lines = file.diff.split("\n");
    let count = 0;
    try {
      const regex = new RegExp(searchQuery, "gi");
      lines.forEach((line) => {
        const matches = line.match(regex);
        if (matches) {
          count += matches.length;
        }
      });
    } catch (error) {
      // 如果正则表达式无效，忽略错误
      console.warn("Invalid regex in search query:", error);
    }

    setContentMatchCount(count);
  }, [searchQuery, file.diff]);

  // 只要有任何一种匹配就显示
  const hasMatch = !searchQuery || pathMatchCount > 0 || contentMatchCount > 0;
  if (!hasMatch) {
    return null;
  }

  return (
    <div
      className={cn(
        "group flex items-center h-[32px] select-none cursor-pointer transition-colors duration-100 ease-in-out",
        isOpen
          ? "bg-list-active-bg text-list-active-fg shadow-sm"
          : selected
          ? "bg-list-inactive-bg text-list-inactive-fg"
          : "hover:bg-list-hover-bg active:bg-list-active-bg active:bg-opacity-50"
      )}
      onClick={handleClick}
    >
      <div className="flex-1 flex items-center min-w-0 h-full">
        <div
          className="checkbox-container flex items-center justify-center w-8 h-full transition-opacity duration-100 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
        >
          <Checkbox checked={selected} onChange={handleSelect} />
        </div>

        <div className="flex-1 flex items-center gap-2 truncate text-[13px] pl-1 pr-2">
          <div className="flex items-center gap-0.5 transition-colors duration-100">
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
              text={viewMode === "tree" ? basename(file.path) : file.path}
              highlight={searchQuery}
              onMatchCount={setPathMatchCount}
            />
          </span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 px-2 text-[12px] tabular-nums transition-colors duration-100",
          !selected && "text-[var(--vscode-descriptionForeground)]"
        )}
      >
        {searchQuery && (pathMatchCount > 0 || contentMatchCount > 0) && (
          <span
            className={cn(
              "text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)] px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1",
              selected && "opacity-80"
            )}
          >
            {pathMatchCount > 0 && (
              <span title="Matches in filename">{pathMatchCount}</span>
            )}
            {pathMatchCount > 0 && contentMatchCount > 0 && (
              <span className="opacity-40">·</span>
            )}
            {contentMatchCount > 0 && (
              <span title="Matches in content">{contentMatchCount}</span>
            )}
          </span>
        )}
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
