import React from 'react';
import { FileItem } from './FileItem';
import type { FileChange } from '../../../state/types';

export interface FlatViewProps {
  files: FileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  hasOpenedFile: boolean;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string, metaKey: boolean) => void;
}

export const FlatView: React.FC<FlatViewProps> = ({
  files,
  selectedFiles,
  selectedPath,
  searchQuery,
  hasOpenedFile,
  onSelect,
  onFileClick,
}) => {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {files.map((file) => (
        <FileItem
          key={file.path}
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
