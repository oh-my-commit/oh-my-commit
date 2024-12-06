import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodeDivider,
  vsCodePanels,
  vsCodePanelTab,
  vsCodePanelView,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";
import "./CommitMessage.css";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodeDivider(),
  vsCodePanels(),
  vsCodePanelTab(),
  vsCodePanelView()
);

interface CommitState {
  message: string;
  description: string;
  isAmendMode: boolean;
  diff: string;
  filesChanged: Array<{
    path: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
}

const CommitMessage = () => {
  const [state, setState] = React.useState<CommitState>({
    message: "",
    description: "",
    isAmendMode: false,
    diff: "",
    filesChanged: [],
  });

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
            message: message.initialMessage || "",
            description: message.description || "",
            filesChanged: message.filesChanged || [],
          }));
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!state.message.trim()) return;

    const commitMessage = state.description
      ? `${state.message}\n\n${state.description}`.trim()
      : state.message.trim();

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

  return (
    <div className="commit-container">
      <div className="commit-form">
        <input
          type="text"
          className="commit-input"
          value={state.message}
          onChange={(e) => {
            const value = e.target.value.split("\n")[0];
            setState((prev) => ({ ...prev, message: value }));
          }}
          placeholder="Message (press Cmd+Enter to commit)"
          autoFocus
        />

        {state.description && (
          <vscode-text-area
            value={state.description}
            onChange={(e: any) =>
              setState((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Extended description (optional)"
            resize="vertical"
            rows={3}
          />
        )}

        <div className="files-section">
          <div className="section-header">
            <span className="section-title">Changes</span>
            <span className="file-count">
              {state.filesChanged.length} files
            </span>
          </div>

          <div className="files-list">
            {state.filesChanged.map((file, index) => (
              <div key={index} className="file-item">
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
            ))}
          </div>

          {state.diff && (
            <div className="diff-preview">
              <pre>{state.diff}</pre>
            </div>
          )}
        </div>
      </div>

      <footer className="button-container">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button onClick={handleSubmit} disabled={!state.message.trim()}>
          {state.isAmendMode ? "Amend Commit" : "Commit Changes"}
        </vscode-button>
      </footer>
    </div>
  );
};

export { CommitMessage };
