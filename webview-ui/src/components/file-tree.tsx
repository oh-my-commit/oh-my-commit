// Error Boundary Component
import { FileTreeErrorBoundary } from "@/components/file-tree-error-boundary";
import { TreeNode } from "@/types/tree-node";
import { getAllFiles } from "@/utils/get-all-files";
import { getDirectoryStats } from "@/utils/get-directory-stats";
import React from "react";

export const FileTreeNode: React.FC<{
  node: TreeNode;
  level: number;
  onToggle: (path: string) => void;
  expandedFile: string | null;
  selectedFiles: Set<string>;
  onSelectionChange: (paths: string[], selected: boolean) => void;
}> = ({
  node,
  level,
  onToggle,
  expandedFile,
  selectedFiles,
  onSelectionChange,
}) => {
  // Early return if node is invalid
  if (!node || !node.path) {
    console.warn("Invalid node received in FileTreeNode");
    return null;
  }

  const [expanded, setExpanded] = React.useState(true);
  const indent = level * 16;

  // 使用 useMemo 缓存目录的所有文件列表
  const allFiles = React.useMemo(() => {
    if (node.type === "directory") {
      return getAllFiles(node);
    }
    return [];
  }, [node]);

  // 使用 useMemo 缓存目录的复选框状态
  const directoryCheckState = React.useMemo(() => {
    if (node.type !== "directory" || !allFiles.length) {
      return "unchecked";
    }

    const selectedCount = allFiles.filter((f) => selectedFiles.has(f)).length;
    if (selectedCount === 0) return "unchecked";
    if (selectedCount === allFiles.length) return "checked";
    return "indeterminate";
  }, [node.type, allFiles, selectedFiles]);

  const handleDirectorySelect = React.useCallback(() => {
    // 如果是 indeterminate 状态，点击时应该变成 checked
    const newChecked = directoryCheckState === "indeterminate" ? true : directoryCheckState !== "checked";
    onSelectionChange(allFiles, newChecked);
  }, [directoryCheckState, allFiles, onSelectionChange]);

  const handleFileSelect = React.useCallback((path: string) => {
    onSelectionChange([path], !selectedFiles.has(path));
  }, [onSelectionChange, selectedFiles]);

  if (node.type === "directory") {
    const stats = getDirectoryStats(node, selectedFiles);

    return (
      <div>
        <div className="directory-item" style={{ paddingLeft: `${indent}px` }}>
          <vscode-checkbox
            checked={directoryCheckState === "checked"}
            indeterminate={directoryCheckState === "indeterminate"}
            onClick={handleDirectorySelect}
          />
          <span
            className="directory-icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▼" : "▶"}
          </span>
          <span
            className="directory-name"
            onClick={() => setExpanded(!expanded)}
          >
            {node.displayName}
          </span>
          <span className="directory-stats">
            {stats.selectedFiles}/{stats.totalFiles} files
            {(stats.additions > 0 || stats.deletions > 0) && (
              <span className="changes-stats">
                <span className="additions">+{stats.additions}</span>
                <span className="deletions">-{stats.deletions}</span>
              </span>
            )}
          </span>
        </div>
        {expanded &&
          node.children?.map((child: TreeNode, index: number) =>
            child && child.path ? (
              <FileTreeErrorBoundary key={`${child.path}-${index}`}>
                <FileTreeNode
                  node={child}
                  level={level + 1}
                  onToggle={onToggle}
                  expandedFile={expandedFile}
                  selectedFiles={selectedFiles}
                  onSelectionChange={onSelectionChange}
                />
              </FileTreeErrorBoundary>
            ) : null
          )}
      </div>
    );
  }

  // File node
  const fileInfo = node.fileInfo;
  if (!fileInfo?.path) return null;

  const isSelected = selectedFiles.has(fileInfo.path);

  return (
    <div>
      <div
        className={`file-item ${
          expandedFile === fileInfo.path ? "expanded" : ""
        }`}
        style={{ paddingLeft: `${indent}px` }}
      >
        <vscode-checkbox
          checked={isSelected}
          onClick={() => handleFileSelect(fileInfo.path)}
        />
        <span
          className={`file-status status-${fileInfo.status}`}
          onClick={() => onToggle(fileInfo.path)}
        >
          {fileInfo.status}
        </span>
        <span className="file-name" onClick={() => onToggle(fileInfo.path)}>
          {node.displayName}
        </span>
        <div className="file-stats">
          {fileInfo.additions > 0 && (
            <span className="additions">+{fileInfo.additions}</span>
          )}
          {fileInfo.deletions > 0 && (
            <span className="deletions">-{fileInfo.deletions}</span>
          )}
        </div>
      </div>
      {expandedFile === fileInfo.path && (
        <div className="file-diff" style={{ paddingLeft: `${indent + 16}px` }}>
          <pre>{fileInfo.diff}</pre>
        </div>
      )}
    </div>
  );
};
