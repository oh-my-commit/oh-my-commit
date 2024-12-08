import React from 'react';
import { cn } from '../../../lib/utils';
import { HighlightText } from '../../common/HighlightText';
import { STATUS_COLORS, STATUS_LABELS, STATUS_LETTERS } from './constants';
import type { FileChange } from '../../../state/types';

interface FileItemProps {
  file: FileChange;
  isSelected: boolean;
  isActive: boolean;
  searchQuery?: string;
  onSelect?: (path: string) => void;
  onClick?: (path: string, metaKey: boolean) => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  isSelected,
  isActive,
  searchQuery = '',
  onSelect,
  onClick,
}) => {
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
          <div className="w-3 h-3 relative">
            <input
              type="checkbox"
              className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
              checked={isSelected}
              onChange={() => onSelect?.(file.path)}
            />
            <div
              className={cn(
                "absolute inset-0 border rounded",
                "border-[var(--vscode-checkbox-border)]",
                isSelected &&
                  "bg-[var(--vscode-checkbox-background)] border-[var(--vscode-checkbox-foreground)]"
              )}
            />
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--vscode-checkbox-foreground)]">
                <svg
                  className="w-2 h-2"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>
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
          <span
            className={cn(
              "text-git-added-fg",
              isActive && "text-inherit"
            )}
          >
            +{file.additions}
          </span>
        )}
        {file.deletions > 0 && (
          <span
            className={cn(
              "text-git-deleted-fg",
              isActive && "text-inherit"
            )}
          >
            −{file.deletions}
          </span>
        )}
      </div>
    </div>
  );
};
