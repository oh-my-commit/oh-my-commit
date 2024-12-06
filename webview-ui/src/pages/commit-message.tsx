import { FileTreeNode } from "@/components/file-tree";
import { FileTreeErrorBoundary } from "@/components/file-tree-error-boundary";
import { mockFileChanges } from "@/data/mock-file-changes";
import { mockRecentCommits } from "@/data/mock-recent-commits";
import { CommitState } from "@/types/commit-state";
import { DetailedDescription } from "@/components/detailed-description";

import { buildFileTree } from "@/utils/build-file-tree";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodeDivider,
  vsCodeCheckbox,
} from "@vscode/webview-ui-toolkit";
import React from "react";
import { getVsCodeApi } from "@/utils/vscode";
import "./commit-message.css";
import classnames from "classnames";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodeDivider(),
  vsCodeCheckbox()
);

const CommitMessage = () => {
  // 业务状态
  const [state, setState] = React.useState<CommitState>({
    title: "",
    body: `
  const textarea = textareaRef.current;
  if (!textarea) return;
  
  // 先将高度设为 0，这样可以正确计算 scrollHeight
  textarea.style.height = '0';
  
  // 然后设置为实际需要的高度
  const height = Math.max(150, textarea.scrollHeight);
  textarea.style.height = \`\${height}px\`;
    `,
    isAmendMode: false,
    diff: "",
    filesChanged: mockFileChanges,
    selectedFiles: new Set(mockFileChanges.map((f) => f.path)), // 默认全选
  });

  // UI 状态
  const [descriptionViewMode, setDescriptionViewMode] = React.useState<
    "plain" | "split" | "preview"
  >("split");

  // 从本地存储加载 viewMode
  React.useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem(
        "commit_description_view_mode"
      );
      if (
        savedViewMode &&
        ["plain", "split", "preview"].includes(savedViewMode)
      ) {
        setDescriptionViewMode(savedViewMode as "plain" | "split" | "preview");
      }
    } catch (error) {
      console.warn("Failed to load view mode from localStorage:", error);
    }
  }, []);

  // 保存 viewMode 到本地存储
  const handleViewModeChange = React.useCallback(
    (newMode: "plain" | "split" | "preview") => {
      setDescriptionViewMode(newMode);
      try {
        localStorage.setItem("commit_description_view_mode", newMode);
      } catch (error) {
        console.warn("Failed to save view mode to localStorage:", error);
      }
    },
    []
  );

  const [expandedFile, setExpandedFile] = React.useState<string | null>(null);
  const [expandedCommit, setExpandedCommit] = React.useState<string | null>(
    null
  );

  const vscode = React.useMemo(() => getVsCodeApi(), []);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "init":
          setState((prev) => {
            const filesChanged = message.filesChanged || [];
            return {
              ...prev,
              isAmendMode: message.isAmendMode,
              diff: message.diff || "",
              title: message.initialMessage?.split("\\n")[0] || "",
              body:
                message.initialMessage?.split("\\n").slice(1).join("\\n") || "",
              filesChanged,
              selectedFiles: new Set(filesChanged.map((f: any) => f.path)), // 更新选中的文件
            };
          });
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
  const handleFileSelection = (paths: string[], selected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedFiles);
      paths.forEach((path) => {
        if (selected) {
          newSelected.add(path);
        } else {
          newSelected.delete(path);
        }
      });
      return { ...prev, selectedFiles: newSelected };
    });
  };

  // 只计算选中文件的统计信息
  const stats = React.useMemo(
    () =>
      state.filesChanged
        .filter((file) => state.selectedFiles.has(file.path))
        .reduce(
          (acc, file) => ({
            additions: acc.additions + file.additions,
            deletions: acc.deletions + file.deletions,
          }),
          { additions: 0, deletions: 0 }
        ),
    [state.filesChanged, state.selectedFiles]
  );

  const fileTree = React.useMemo(
    () => buildFileTree(state.filesChanged),
    [state.filesChanged]
  );

  const handleCommitClick = (hash: string) => {
    setExpandedCommit(expandedCommit === hash ? null : hash);
  };

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    // 可以添加一个提示，但VS Code环境下可能不需要
  };

  return (
    <div className="commit-container">
      <div className="commit-form">
        <div className="commit-input-section">
          <div className="section-header">
            <div className="section-title">
              <span>Commit Message</span>
              <span className="ai-badge">AI</span>
              <span className="hint">
                Review and edit the generated message
              </span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <div className="input-label">Title</div>
            </div>
            <input
              type="text"
              className="commit-title"
              value={state.title}
              onChange={(e) => {
                const value = e.target.value.split("\n")[0];
                setState((prev) => ({ ...prev, title: value }));
              }}
              placeholder="Enter commit title (press Cmd+Enter to commit)"
              autoFocus
            />
          </div>

          <div className="input-group">
            <div className="input-header">
              <div className="input-label">Description</div>
              <div className="input-options">
                <div
                  className="view-mode-buttons"
                  title="Toggle editor view mode"
                >
                  <button
                    className={classnames("mode-button", {
                      active: descriptionViewMode === "plain",
                    })}
                    onClick={() => handleViewModeChange("plain")}
                    title="Edit in plain text mode"
                  >
                    Plain
                  </button>
                  <button
                    className={classnames("mode-button", {
                      active: descriptionViewMode === "split",
                    })}
                    onClick={() => handleViewModeChange("split")}
                    title="Edit with live preview"
                  >
                    Split
                  </button>
                  <button
                    className={classnames("mode-button", {
                      active: descriptionViewMode === "preview",
                    })}
                    onClick={() => handleViewModeChange("preview")}
                    title="View rendered preview"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
            <DetailedDescription
              value={state.body}
              onChange={(value) =>
                setState((prev) => ({ ...prev, body: value }))
              }
              placeholder="Enter detailed description (optional)"
              viewMode={descriptionViewMode}
            />
          </div>
        </div>

        <div className="changes-section">
          <div className="section-header">
            <div className="section-title">
              <span>Changed Files</span>
              <div className="stats-group">
                <span className="stats-badge">
                  <span className="additions">+{stats.additions}</span>
                  <span className="deletions">-{stats.deletions}</span>
                </span>
                <span className="file-count">
                  {state.filesChanged.length} files
                </span>
              </div>
            </div>
          </div>

          <div className="files-tree">
            <FileTreeErrorBoundary>
              {fileTree.map((node, index) => (
                <FileTreeNode
                  key={`${node.path}-${index}`}
                  node={node}
                  level={0}
                  onToggle={setExpandedFile}
                  expandedFile={expandedFile}
                  selectedFiles={state.selectedFiles}
                  onSelectionChange={handleFileSelection}
                />
              ))}
            </FileTreeErrorBoundary>
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
                className={`commit-item ${
                  expandedCommit === commit.hash ? "expanded" : ""
                }`}
              >
                <div className="commit-summary">
                  <button
                    className="expand-button"
                    onClick={() => handleCommitClick(commit.hash)}
                    title={
                      expandedCommit === commit.hash
                        ? "Collapse details"
                        : "Expand details"
                    }
                  >
                    <span
                      className={`expand-icon ${
                        expandedCommit === commit.hash ? "expanded" : ""
                      }`}
                    >
                      ▶
                    </span>
                  </button>
                  <span className="commit-message">{commit.message}</span>
                  <span className="commit-date">{commit.date}</span>
                  <button
                    className="hash-button"
                    onClick={(e) => handleCopyHash(commit.hash, e)}
                    title="Click to copy commit hash"
                  >
                    {commit.hash.slice(0, 7)}
                  </button>
                </div>
                <div className="commit-details">
                  <div className="commit-author">{commit.author}</div>
                  <div className="commit-description">{commit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="commit-actions">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button
          appearance="primary"
          onClick={handleSubmit}
          disabled={!state.title.trim()}
        >
          {state.isAmendMode ? "Amend Commit" : "Commit Changes"}
        </vscode-button>
      </div>
    </div>
  );
};

export { CommitMessage };
