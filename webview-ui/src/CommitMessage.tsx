import React, { useEffect, useState } from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";

// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

// 获取 VSCode API
const vscode = acquireVsCodeApi();

export const CommitMessage: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    vscode.postMessage({
      command: "submit",
      text: message,
    });
  };

  const handleCancel = () => {
    vscode.postMessage({
      command: "cancel",
    });
  };

  return (
    <div className="container">
      <vscode-text-area
        value={message}
        onChange={(e: any) => setMessage(e.target.value)}
        placeholder="Enter commit message..."
        rows={5}
      />
      <div className="button-container">
        <vscode-button onClick={handleSubmit}>Commit 2 </vscode-button>
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
      </div>
    </div>
  );
};
