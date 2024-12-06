// Error Boundary Component
import {FileTreeErrorBoundary} from "@/components/file-tree-error-boundary";
import {TreeNode} from "@/types/tree-node";
import {getAllFiles} from "@/utils/get-all-files";
import {getDirectoryStats} from "@/utils/get-directory-stats";
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

    const getDirectoryCheckState = (
        node: TreeNode
    ): "checked" | "unchecked" | "indeterminate" => {
        if (!node?.children?.length) return "unchecked";

        const allFiles = getAllFiles(node);
        if (!allFiles.length) return "unchecked";

        const selectedCount = allFiles.filter((f) => selectedFiles.has(f)).length;
        if (selectedCount === 0) return "unchecked";
        if (selectedCount === allFiles.length) return "checked";
        return "indeterminate";
    };

    const handleDirectorySelect = (checked: boolean) => {
        const files = getAllFiles(node);
        onSelectionChange(files, checked);
    };

    if (node.type === "directory") {
        const checkState = getDirectoryCheckState(node);
        const stats = getDirectoryStats(node, selectedFiles);

        return (
            <div>
                <div className="directory-item" style={{paddingLeft: `${indent}px`}}>
                    <vscode-checkbox
                        checked={checkState === "checked"}
                        indeterminate={checkState === "indeterminate"}
                        onChange={(e: any) => handleDirectorySelect(e.target.checked)}
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
            {node.path}
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

    return (
        <div>
            <div
                className={`file-item ${
                    expandedFile === fileInfo.path ? "expanded" : ""
                }`}
                style={{paddingLeft: `${indent}px`}}
            >
                <vscode-checkbox
                    checked={selectedFiles.has(fileInfo.path)}
                    onChange={(e: any) =>
                        onSelectionChange([fileInfo.path], e.target.checked)
                    }
                />
                <span
                    className={`file-status status-${fileInfo.status}`}
                    onClick={() => onToggle(fileInfo.path)}
                >
          {fileInfo.status}
        </span>
                <span className="file-name" onClick={() => onToggle(fileInfo.path)}>
          {node.path}
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
                <div className="file-diff" style={{paddingLeft: `${indent + 16}px`}}>
                    <pre>{fileInfo.diff}</pre>
                </div>
            )}
        </div>
    );
};