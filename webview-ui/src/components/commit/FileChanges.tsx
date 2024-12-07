import React from "react";
import { useAtom } from "jotai";
import {
  commitFilesAtom,
  commitStatsAtom,
} from "../../state/atoms/commit-core";
import {
  selectFileAtom,
  selectedFileAtom,
  showDiffAtom,
} from "../../state/atoms/commit-ui";
import { DiffViewer } from "./DiffViewer";
import type { FileChange } from "../../state/types";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [files] = useAtom(commitFilesAtom);
  const [stats] = useAtom(commitStatsAtom);
  const [selectedPath] = useAtom(selectedFileAtom);
  const [showDiff] = useAtom(showDiffAtom);
  const [, selectFile] = useAtom(selectFileAtom);

  const handleFileClick = (path: string) => {
    selectFile(path);
    onFileSelect?.(path);
  };

  return (
    <div className="changes-section">
      <div className="changes-header">
        <div className="section-title">
          Changes
          <div className="stats-group">
            <span className="stats-badge">
              <span className="additions">+{stats.additions}</span>
              <span className="deletions">-{stats.deletions}</span>
            </span>
            <span className="file-count">{files.length} files</span>
          </div>
        </div>
      </div>

      <div className="changes-content">
        <div className="files-panel">
          {files.map((file: FileChange) => (
            <div
              key={file.path}
              className={`file-item ${
                file.path === selectedPath ? "selected" : ""
              }`}
              onClick={() => handleFileClick(file.path)}
            >
              <span className={`file-icon ${file.status}`} title={file.status} />
              <span className="file-path">{file.path}</span>
              <span className="file-stats">
                {file.additions > 0 && <span className="additions">+{file.additions}</span>}
                {file.deletions > 0 && <span className="deletions">-{file.deletions}</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="diff-panel">
          {selectedPath ? (
            showDiff && <DiffViewer />
          ) : (
            <div className="diff-placeholder">
              <span>Select a file to view changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
