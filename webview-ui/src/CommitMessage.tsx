import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodeDivider,
  vsCodeCheckbox,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";
import "./CommitMessage.css";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodeDivider(),
  vsCodeCheckbox()
);

interface CommitState {
  title: string;
  body: string;
  isAmendMode: boolean;
  diff: string;
  filesChanged: Array<{
    path: string;
    status: string;
    additions: number;
    deletions: number;
    diff: string;
  }>;
  selectedFiles: Set<string>;
}

// Mock data for recent commits
const mockRecentCommits = [
  {
    hash: "a1b2c3d",
    message: "feat: add support for AI-generated commit messages",
    author: "Mark",
    date: "2 hours ago",
    description: "- Added OpenAI integration\n- Implemented message generation\n- Added user configuration",
  },
  {
    hash: "e4f5g6h",
    message: "fix: resolve issue with file change detection",
    author: "Mark",
    date: "5 hours ago",
    description: "Fixed a bug where file changes were not being detected correctly in certain cases.",
  },
  {
    hash: "i7j8k9l",
    message: "refactor: improve code organization",
    author: "Mark",
    date: "1 day ago",
    description: "Major refactoring to improve code organization and maintainability.",
  },
];

// Mock data for file changes
const mockFileChanges = [
  {
    path: "src/services/commit-service.ts",
    status: "M",
    additions: 25,
    deletions: 12,
    diff: `@@ -15,7 +15,7 @@ export class CommitService {
  private readonly git: SimpleGit;
  
  constructor(
-   private readonly context: vscode.ExtensionContext,
+   context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel
  ) {
    this.git = simpleGit();
@@ -42,9 +42,13 @@ export class CommitService {
-   async getCommitMessage(): Promise<string> {
+   async generateCommitMessage(): Promise<string> {
      // Implementation
    }
  }`
  },
  {
    path: "src/webview/CommitMessage.tsx",
    status: "M",
    additions: 156,
    deletions: 89,
    diff: `@@ -1,6 +1,6 @@
  import React from "react";
- import { vsCodeButton } from "@vscode/webview-ui-toolkit";
+ import { vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
  
  export const CommitMessage = () => {
    // Implementation
  }`
  },
  {
    path: "src/webview/styles/commit.css",
    status: "A",
    additions: 145,
    deletions: 0,
    diff: `@@ -0,0 +1,145 @@
+ .commit-container {
+   display: flex;
+   flex-direction: column;
+   height: 100vh;
+ }
+ 
+ .commit-form {
+   flex: 1;
+   padding: 16px;
+ }`
  },
  {
    path: "src/core/git.core.ts",
    status: "M",
    additions: 8,
    deletions: 3,
    diff: `@@ -23,7 +23,7 @@ export class GitCore {
    private readonly workspaceRoot: string;
  
-   constructor(context: vscode.ExtensionContext) {
+   constructor(workspaceRoot: string) {
      this.workspaceRoot = workspaceRoot;
    }
  }`
  },
  {
    path: "src/test/commit-service.test.ts",
    status: "A",
    additions: 67,
    deletions: 0,
    diff: `@@ -0,0 +1,67 @@
+ import { CommitService } from "../services/commit-service";
+ 
+ describe("CommitService", () => {
+   test("should generate commit message", async () => {
+     // Test implementation
+   });
+ });`
  },
  {
    path: "package.json",
    status: "M",
    additions: 3,
    deletions: 1,
    diff: `@@ -9,6 +9,8 @@
    "dependencies": {
      "@vscode/webview-ui-toolkit": "^1.2.0",
+     "simple-git": "^3.19.0",
+     "typescript": "^5.0.4"
    }`
  }
];

interface TreeNode {
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  fileInfo?: {
    status: string;
    additions: number;
    deletions: number;
    diff: string;
  };
}

const buildFileTree = (files: CommitState['filesChanged']): TreeNode[] => {
  const root: { [key: string]: TreeNode } = {};

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join('/');
      if (!current[currentPath]) {
        current[currentPath] = {
          path: part,
          type: index === parts.length - 1 ? 'file' : 'directory',
          children: index === parts.length - 1 ? undefined : {},
          fileInfo: index === parts.length - 1 ? file : undefined
        };
      }
      if (index < parts.length - 1) {
        current = current[currentPath].children as { [key: string]: TreeNode };
      }
    });
  });

  const convertToArray = (node: { [key: string]: TreeNode }): TreeNode[] => {
    return Object.values(node).map(n => ({
      ...n,
      children: n.children ? convertToArray(n.children as { [key: string]: TreeNode }) : undefined
    }));
  };

  return convertToArray(root);
};

const FileTreeNode: React.FC<{
  node: TreeNode;
  level: number;
  onToggle: (path: string) => void;
  expandedFile: string | null;
  selectedFiles: Set<string>;
  onSelectionChange: (path: string, selected: boolean) => void;
}> = ({ node, level, onToggle, expandedFile, selectedFiles, onSelectionChange }) => {
  const [expanded, setExpanded] = React.useState(true);
  const indent = level * 16;

  // 计算目录的选中状态
  const getDirectoryCheckState = (node: TreeNode): 'checked' | 'unchecked' | 'indeterminate' => {
    if (!node.children) return 'unchecked';
    
    const allFiles = getAllFiles(node);
    const selectedCount = allFiles.filter(f => selectedFiles.has(f)).length;
    
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === allFiles.length) return 'checked';
    return 'indeterminate';
  };

  // 获取目录下所有文件路径
  const getAllFiles = (node: TreeNode): string[] => {
    if (node.type === 'file') return [node.fileInfo!.path];
    return node.children?.flatMap(getAllFiles) || [];
  };

  // 处理目录选中状态变化
  const handleDirectorySelect = (checked: boolean) => {
    const files = getAllFiles(node);
    files.forEach(file => {
      onSelectionChange(file, checked);
    });
  };

  if (node.type === 'directory') {
    const checkState = getDirectoryCheckState(node);
    
    return (
      <div>
        <div 
          className="directory-item"
          style={{ paddingLeft: `${indent}px` }}
        >
          <vsCodeCheckbox
            checked={checkState === 'checked'}
            indeterminate={checkState === 'indeterminate'}
            onChange={(e: any) => handleDirectorySelect(e.target.checked)}
          />
          <span className="directory-icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? '▼' : '▶'}
          </span>
          <span className="directory-name" onClick={() => setExpanded(!expanded)}>
            {node.path}
          </span>
        </div>
        {expanded && node.children && (
          <div className="directory-children">
            {node.children.map((child, index) => (
              <FileTreeNode
                key={child.path + index}
                node={child}
                level={level + 1}
                onToggle={onToggle}
                expandedFile={expandedFile}
                selectedFiles={selectedFiles}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const fileInfo = node.fileInfo!;
  return (
    <div>
      <div 
        className={`file-item ${expandedFile === fileInfo.path ? 'expanded' : ''}`}
        style={{ paddingLeft: `${indent}px` }}
      >
        <vsCodeCheckbox
          checked={selectedFiles.has(fileInfo.path)}
          onChange={(e: any) => onSelectionChange(fileInfo.path, e.target.checked)}
        />
        <span 
          className={`file-status status-${fileInfo.status}`}
          onClick={() => onToggle(fileInfo.path)}
        >
          {fileInfo.status}
        </span>
        <span 
          className="file-name"
          onClick={() => onToggle(fileInfo.path)}
        >
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
        <div className="file-diff" style={{ paddingLeft: `${indent + 16}px` }}>
          <pre>{fileInfo.diff}</pre>
        </div>
      )}
    </div>
  );
};

const CommitMessage = () => {
  const [state, setState] = React.useState<CommitState>({
    title: "",
    body: "",
    isAmendMode: false,
    diff: "",
    filesChanged: mockFileChanges,
    selectedFiles: new Set(mockFileChanges.map(f => f.path))  // 默认全选
  });

  const [expandedFile, setExpandedFile] = React.useState<string | null>(null);
  const [hoveredCommit, setHoveredCommit] = React.useState<string | null>(null);

  const vscode = React.useMemo(() => getVsCodeApi(), []);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "init":
          setState((prev) => ({
            ...prev,
            isAmendMode: message.isAmendMode,
            diff: message.diff || "",
            title: message.initialMessage?.split("\\n")[0] || "",
            body: message.initialMessage?.split("\\n").slice(1).join("\\n") || "",
            filesChanged: message.filesChanged || [],
          }));
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!state.title.trim()) return;

    const commitMessage = state.body
      ? `${state.title}\n\n${state.body}`.trim()
      : state.title.trim();

    vscode.postMessage({
      command: "commit",
      message: commitMessage,
      isAmendMode: state.isAmendMode,
    });
  }, [state, vscode]);

  const handleCancel = React.useCallback(() => {
    vscode.postMessage({ command: "cancel" });
  }, [vscode]);

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 处理文件选择变化
  const handleFileSelection = (path: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedFiles);
      if (selected) {
        newSelected.add(path);
      } else {
        newSelected.delete(path);
      }
      return { ...prev, selectedFiles: newSelected };
    });
  };

  // 只计算选中文件的统计信息
  const stats = React.useMemo(() => 
    state.filesChanged
      .filter(file => state.selectedFiles.has(file.path))
      .reduce(
        (acc, file) => ({
          additions: acc.additions + file.additions,
          deletions: acc.deletions + file.deletions,
        }),
        { additions: 0, deletions: 0 }
      ),
    [state.filesChanged, state.selectedFiles]
  );

  const fileTree = React.useMemo(() => buildFileTree(state.filesChanged), [state.filesChanged]);

  return (
    <div className="commit-container">
      <div className="commit-form">
        <div className="commit-input-section">
          <div className="input-header">
            <span className="ai-badge">AI</span>
            <span className="hint">Review and edit the generated commit message</span>
          </div>
          
          <input
            type="text"
            className="commit-title"
            value={state.title}
            onChange={(e) => {
              const value = e.target.value.split("\n")[0];
              setState((prev) => ({ ...prev, title: value }));
            }}
            placeholder="Title (press Cmd+Enter to commit)"
            autoFocus
          />

          <vsCodeTextArea
            value={state.body}
            onChange={(e: any) =>
              setState((prev) => ({ ...prev, body: e.target.value }))
            }
            placeholder="Detailed description (optional)"
            resize="vertical"
            rows={3}
          />
        </div>

        <div className="changes-section">
          <div className="section-header">
            <div className="section-title">
              <span>Changed Files</span>
              <span className="stats-badge">
                <span className="additions">+{stats.additions}</span>
                <span className="deletions">-{stats.deletions}</span>
              </span>
            </div>
            <span className="file-count">{state.filesChanged.length} files</span>
          </div>

          <div className="files-tree">
            {fileTree.map((node, index) => (
              <FileTreeNode
                key={node.path + index}
                node={node}
                level={0}
                onToggle={setExpandedFile}
                expandedFile={expandedFile}
                selectedFiles={state.selectedFiles}
                onSelectionChange={handleFileSelection}
              />
            ))}
          </div>
        </div>

        <div className="recent-commits-section">
          <div className="section-header">
            <span className="section-title">Recent Commits</span>
          </div>
          
          <div className="commits-list">
            {mockRecentCommits.map((commit) => (
              <div
                key={commit.hash}
                className="commit-item"
                onMouseEnter={() => setHoveredCommit(commit.hash)}
                onMouseLeave={() => setHoveredCommit(null)}
              >
                <span className="commit-hash">{commit.hash.slice(0, 7)}</span>
                <span className="commit-message">{commit.message}</span>
                <span className="commit-date">{commit.date}</span>
                {hoveredCommit === commit.hash && (
                  <div className="commit-details">
                    <div className="commit-author">{commit.author}</div>
                    <div className="commit-description">{commit.description}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="button-container">
        <vsCodeButton appearance="secondary" onClick={handleCancel}>
          Cancel
        </vsCodeButton>
        <vsCodeButton onClick={handleSubmit} disabled={!state.title.trim()}>
          {state.isAmendMode ? "Amend Commit" : "Commit Changes"}
        </vsCodeButton>
      </footer>
    </div>
  );
};

export { CommitMessage };
