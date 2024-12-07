import React from "react";
import { VSCodeButton, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

interface CommitMessageProps {
  message: string;
  detail: string;
  setMessage: (message: string) => void;
  setDetail: (detail: string) => void;
  onCommit: () => void;
  selectedFilesCount: number;
  disabled?: boolean;
}

export function CommitMessage({
  message,
  detail,
  setMessage,
  setDetail,
  onCommit,
  selectedFilesCount,
  disabled,
}: CommitMessageProps) {
  return (
    <div className="commit-message">
      <VSCodeTextArea
        value={message}
        onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
        placeholder="Enter commit message"
      />
      <VSCodeTextArea
        value={detail}
        onChange={(e) => setDetail((e.target as HTMLTextAreaElement).value)}
        placeholder="Enter detailed description (optional)"
      />
      <div className="commit-actions">
        <VSCodeButton
          appearance="primary"
          onClick={onCommit}
          disabled={disabled}
        >
          Commit Changes ({selectedFilesCount} files)
        </VSCodeButton>
      </div>
    </div>
  );
}
