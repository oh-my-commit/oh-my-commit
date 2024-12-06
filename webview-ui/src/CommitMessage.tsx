import React from "react";
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextArea,
} from "@vscode/webview-ui-toolkit";

// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea());

// 在开发环境中模拟 VSCode API
const mockVsCodeApi = {
  postMessage: (message: any) => {
    console.log("Development mode - Message posted:", message);
  },
  getState: () => {
    return {};
  },
  setState: (state: any) => {
    console.log("Development mode - State updated:", state);
  },
};

// 获取真实或模拟的 VSCode API
const getVsCodeApi = () => {
  if (typeof acquireVsCodeApi === "function") {
    return acquireVsCodeApi();
  }
  console.log("Development mode - Using mock VSCode API");
  return mockVsCodeApi;
};

const CommitMessage = () => {
  const [message, setMessage] = React.useState("");
  const vscode = React.useMemo(() => getVsCodeApi(), []);

  const handleSubmit = React.useCallback(() => {
    vscode.postMessage({
      command: "submit",
      text: message,
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
      />
      <div className="button-container">
        <vscode-button appearance="secondary" onClick={handleCancel}>
          Cancel
        </vscode-button>
        <vscode-button onClick={handleSubmit}>Commit</vscode-button>
      </div>
    </div>
  );
};

export { CommitMessage };
