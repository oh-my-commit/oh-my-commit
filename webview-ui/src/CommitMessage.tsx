import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodeDivider,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";
import "./CommitMessage.css";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodeDivider()
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

const CommitMessage = () => {
  const [state, setState] = React.useState<CommitState>({
    title: "",
    body: "",
    isAmendMode: false,
    diff: "",
    filesChanged: mockFileChanges,  // 使用 mock 数据
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

  // 计算文件变更统计
  const stats = state.filesChanged.reduce(
    (acc, file) => {
      acc.additions += file.additions;
      acc.deletions += file.deletions;
      return acc;
    },
    { additions: 0, deletions: 0 }
  );

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

          <vscode-text-area
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

          <div className="files-list">
            {state.filesChanged.map((file) => (
              <React.Fragment key={file.path}>
                <div 
                  className="file-item"
                  onClick={() => setExpandedFile(
                    expandedFile === file.path ? null : file.path
                  )}
                >
                  <span className={`file-status status-${file.status}`}>
                    {file.status}
                  </span>
                  <span className="file-path">{file.path}</span>
                  <div className="file-stats">
                    {file.additions > 0 && (
                      <span className="additions">+{file.additions}</span>
                    )}
                    {file.deletions > 0 && (
                      <span className="deletions">-{file.deletions}</span>
                    )}
                  </div>
                </div>
                {expandedFile === file.path && (
                  <div className="file-diff">
                    <pre>{file.diff}</pre>
                  </div>
                )}
              </React.Fragment>
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
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button onClick={handleSubmit} disabled={!state.title.trim()}>
          {state.isAmendMode ? "Amend Commit" : "Commit Changes"}
        </vscode-button>
      </footer>
    </div>
  );
};

export { CommitMessage };
