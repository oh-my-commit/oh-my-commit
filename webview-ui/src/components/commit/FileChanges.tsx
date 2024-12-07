import React, { useMemo, useState } from "react";
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
import "./FileChanges.css";

interface TreeNode {
  name: string;
  path: string;
  children: { [key: string]: TreeNode };
  file?: FileChange;
}

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [files] = useAtom(commitFilesAtom);
  const [stats] = useAtom(commitStatsAtom);
  const [selectedPath] = useAtom(selectedFileAtom);
  const [showDiff] = useAtom(showDiffAtom);
  const [, selectFile] = useAtom(selectFileAtom);
  const [isTreeView, setIsTreeView] = useState(false);

  const handleFileClick = (path: string) => {
    selectFile(path);
    onFileSelect?.(path);
  };

  const fileTree = useMemo(() => {
    const root: TreeNode = { name: "", path: "", children: {} };

    files.forEach((file) => {
      const parts = file.path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        const currentPath = parts.slice(0, index + 1).join("/");
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            children: {},
          };
        }
        current = current.children[part];
        if (index === parts.length - 1) {
          current.file = file;
        }
      });
    });

    return root;
  }, [files]);

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    if (node.file) {
      return (
        <div
          key={node.path}
          className={`file-item ${
            node.path === selectedPath ? "selected" : ""
          }`}
          onClick={() => handleFileClick(node.path)}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <vscode-icon name={node.file.status} />
          <span className="file-path">{node.name}</span>
          <span className="file-stats">
            {node.file.additions > 0 && (
              <span className="additions">+{node.file.additions}</span>
            )}
            {node.file.deletions > 0 && (
              <span className="deletions">-{node.file.deletions}</span>
            )}
          </span>
        </div>
      );
    }

    return (
      <React.Fragment key={node.path}>
        {node.name && (
          <div
            className="folder-item"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            <vscode-icon name="folder" />
            <span className="folder-name">{node.name}</span>
          </div>
        )}
        {Object.values(node.children).map((child) =>
          renderTreeNode(child, level + 1)
        )}
      </React.Fragment>
    );
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
        <button
          className={`view-mode-toggle ${isTreeView ? "tree" : "list"}`}
          onClick={() => setIsTreeView(!isTreeView)}
          title={`Switch to ${isTreeView ? "list" : "tree"} view`}
        >
          <vscode-button appearance="icon">
            <span className={isTreeView ? "view-tree" : "view-list"} />
          </vscode-button>
        </button>
      </div>

      <div className="changes-content">
        <div
          className={`files-panel ${isTreeView ? "tree-view" : "list-view"}`}
        >
          {isTreeView
            ? renderTreeNode(fileTree)
            : files.map((file: FileChange) => (
                <div
                  key={file.path}
                  className={`file-item ${
                    file.path === selectedPath ? "selected" : ""
                  }`}
                  onClick={() => handleFileClick(file.path)}
                >
                  <vscode-icon name={file.status} />
                  <span className="file-path">{file.path}</span>
                  <span className="file-stats">
                    {file.additions > 0 && (
                      <span className="additions">+{file.additions}</span>
                    )}
                    {file.deletions > 0 && (
                      <span className="deletions">-{file.deletions}</span>
                    )}
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
