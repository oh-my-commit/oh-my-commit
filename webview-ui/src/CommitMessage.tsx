import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
  vsCodePanels,
  vsCodePanelTab,
  vsCodePanelView,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";

// Register VSCode Design System
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextArea(),
  vsCodePanels(),
  vsCodePanelTab(),
  vsCodePanelView()
);

const CommitMessage = () => {
  const [message, setMessage] = React.useState("");
  const vscode = React.useMemo(() => getVsCodeApi(), []);

  const handleSubmit = React.useCallback(() => {
    if (!message.trim()) return;
    vscode.postMessage({
      command: "commit",
      message: message.trim(),
    });
  }, [message, vscode]);

  const handleCancel = React.useCallback(() => {
    vscode.postMessage({
      command: "cancel",
    });
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
      <vscode-text-area
        value={message}
        onChange={(e: any) => setMessage(e.target.value)}
        placeholder="Enter your commit message... (Cmd/Ctrl + Enter to commit, Esc to cancel)"
        resize="vertical"
        autofocus
      />
      <div className="button-container">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button onClick={handleSubmit} disabled={!message.trim()}>
          Commit
        </vscode-button>
      </div>
    </div>
  );
};

export { CommitMessage };
