import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeDivider,
  vsCodeCheckbox,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";
import "./CommitMessage.css";

// Register VSCode Design System
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodeDropdown(),
  vsCodeOption(),
  vsCodeDivider(),
  vsCodeCheckbox()
);

interface CommitState {
  message: string;
  description: string;
  type: string;
  isBreakingChange: boolean;
  isAmendMode: boolean;
  diff: string;
}

const COMMIT_TYPES = [
  { value: "feat", label: "feat: A new feature" },
  { value: "fix", label: "fix: A bug fix" },
  { value: "docs", label: "docs: Documentation only changes" },
  {
    value: "style",
    label: "style: Changes that do not affect the meaning of the code",
  },
  {
    value: "refactor",
    label: "refactor: A code change that neither fixes a bug nor adds a feature",
  },
  { value: "perf", label: "perf: A code change that improves performance" },
  { value: "test", label: "test: Adding missing tests" },
  {
    value: "chore",
    label: "chore: Changes to the build process or auxiliary tools",
  },
];

const CommitMessage = () => {
  const [state, setState] = React.useState<CommitState>({
    message: "",
    description: "",
    type: "feat",
    isBreakingChange: false,
    isAmendMode: false,
    diff: "",
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
          }));
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!state.message.trim()) return;

    const prefix = state.isBreakingChange ? "BREAKING CHANGE: " : "";
    const commitMessage = state.type
      ? `${state.type}: ${prefix}${state.message}\n\n${state.description}`.trim()
      : `${prefix}${state.message}\n\n${state.description}`.trim();

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
        <div className="form-section">
          <label>Commit Type</label>
          <vscode-dropdown
            value={state.type}
            onChange={(e: any) =>
              setState((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            {COMMIT_TYPES.map((type) => (
              <vscode-option key={type.value} value={type.value}>
                {type.label}
              </vscode-option>
            ))}
          </vscode-dropdown>
        </div>

        <div className="form-section">
          <label>Commit Title</label>
          <vscode-text-area
            value={state.message}
            onChange={(e: any) =>
              setState((prev) => ({ ...prev, message: e.target.value }))
            }
            placeholder="Enter a concise description of the changes"
            resize="vertical"
            autofocus
          />
        </div>

        <div className="form-section">
          <label>Detailed Description</label>
          <vscode-text-area
            value={state.description}
            onChange={(e: any) =>
              setState((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Add a more detailed explanation of the changes (optional)"
            resize="vertical"
          />
        </div>

        {state.isBreakingChange ? (
          <div className="breaking-change-section">
            <vscode-checkbox
              checked={state.isBreakingChange}
              onChange={(e: any) =>
                setState((prev) => ({
                  ...prev,
                  isBreakingChange: e.target.checked,
                }))
              }
            >
              Breaking Change
            </vscode-checkbox>
            <span>⚠️ This commit contains breaking changes</span>
          </div>
        ) : (
          <vscode-checkbox
            checked={state.isBreakingChange}
            onChange={(e: any) =>
              setState((prev) => ({
                ...prev,
                isBreakingChange: e.target.checked,
              }))
            }
          >
            Breaking Change
          </vscode-checkbox>
        )}

        {state.diff && (
          <div className="diff-preview">
            <h3>Changes to be committed:</h3>
            <pre>{state.diff}</pre>
          </div>
        )}
      </div>

      <vscode-divider />

      <div className="button-container">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button onClick={handleSubmit} disabled={!state.message.trim()}>
          {state.isAmendMode ? "Amend Commit" : "Commit Changes"}
        </vscode-button>
      </div>
    </div>
  );
};

export { CommitMessage };
