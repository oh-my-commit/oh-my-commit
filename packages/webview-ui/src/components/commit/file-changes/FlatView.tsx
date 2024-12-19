import React from "react";
import type { FileChange } from "../../../state/types";
import { FileItem } from "./FileItem";

export interface FlatViewProps {
  files: FileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  hasOpenedFile: boolean;
  onSelect: (path: string) => void;
  onClick: (path: string) => void;
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
  onClick,
  className,
}) => {
  return (
    <div className={className}>
      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          selected={selectedFiles.includes(file.path)}
          isOpen={selectedPath === file.path}
          viewMode="flat"
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
