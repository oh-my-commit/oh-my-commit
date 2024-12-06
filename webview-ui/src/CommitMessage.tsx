import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";
import { getVsCodeApi } from "./vscode";

// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

const CommitMessage = () => {
  const [message, setMessage] = React.useState("");
  const vscode = React.useMemo(() => getVsCodeApi(), []);

  const handleSubmit = React.useCallback(() => {
    vscode.postMessage({
      command: "commit",
      message: message,
    });
  }, [message, vscode]);

  const handleCancel = React.useCallback(() => {
    vscode.postMessage({
      command: "cancel",
    });
  }, [vscode]);

  return (
    <div className="container">
      <vscode-text-area
        value={message}
        onChange={(e: any) => setMessage(e.target.value)}
        placeholder="Enter your commit message..."
        resize="vertical"
      />
      <div className="button-container">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel23
        </vscode-button>
        <vscode-button onClick={handleSubmit}>Commit</vscode-button>
      </div>
    </div>
  );
};

export { CommitMessage };
