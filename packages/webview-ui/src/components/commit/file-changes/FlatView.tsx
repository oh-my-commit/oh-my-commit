import React from "react";
import { FileItem } from "./FileItem";
import type { FileChange } from "../../../state/types";

export interface FlatViewProps {
  files: FileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  hasOpenedFile: boolean;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string, metaKey: boolean) => void;
  renderStatus?: (file: FileChange & { isStaged: boolean }) => React.ReactNode;
  className?: string;
}

export const FlatView: React.FC<FlatViewProps> = ({
  files,
  selectedFiles,
  selectedPath,
  searchQuery,
  hasOpenedFile,
  onSelect,
  onFileClick,
  renderStatus,
  className,
}) => {
  return (
    <div className={className ? className : "flex flex-col gap-0.5 p-2"}>
      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          isSelected={selectedFiles.includes(file.path)}
          isActive={file.path === selectedPath}
          hasOpenedFile={hasOpenedFile}
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClick={onFileClick}
        />
      ))}
    </div>
  );
};
