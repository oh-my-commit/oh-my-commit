import React from "react";
import { FileItem } from "./FileItem";
import type { FileChange } from "../../../state/types";

export interface FlatViewProps {
  files: FileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  hasOpenedFile: boolean;
  onSelect: (path: string) => void;
  onFileClick: (path: string) => void;
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
  className,
}) => {
  return (
    <div className={className}>
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          selected={selectedFiles.includes(file.path)}
          isOpen={selectedPath === file.path}
          viewMode="flat"
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClick={onFileClick}
        />
      ))}
    </div>
  );
};
