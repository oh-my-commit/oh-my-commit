import React from 'react';
import { FileItem } from './FileItem';
import type { FileChange } from '../../../state/types';

interface FlatViewProps {
  files: FileChange[];
  selectedFiles: string[];
  selectedPath?: string;
  searchQuery?: string;
  onSelect?: (path: string) => void;
  onFileClick?: (path: string, metaKey: boolean) => void;
}

export const FlatView: React.FC<FlatViewProps> = ({
  files,
  selectedFiles,
  selectedPath,
  searchQuery,
  onSelect,
  onFileClick,
}) => {
  return (
    <div className="flex flex-col gap-0 p-2">
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          isSelected={selectedFiles.includes(file.path)}
          isActive={file.path === selectedPath}
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClick={onFileClick}
        />
      ))}
    </div>
  );
};
