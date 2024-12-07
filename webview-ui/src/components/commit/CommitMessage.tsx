import React from "react";
import { VSCodeButton, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";

interface CommitMessageProps {
  message: string;
  detail: string;
  onMessageChange: (message: string) => void;
  onDetailChange: (detail: string) => void;
  onCommit: () => void;
  selectedFilesCount: number;
  disabled?: boolean;
}

export function CommitMessage({
  message,
  detail,
  onMessageChange,
  onDetailChange,
  onCommit,
  selectedFilesCount,
  disabled,
}: CommitMessageProps) {
  return (
    <div className="flex flex-col gap-2">
      <VSCodeTextArea
        className="!h-[28px] !min-h-[28px] !bg-vscode-input-background !text-vscode-input-foreground"
        value={message}
        onChange={(e) =>
          onMessageChange((e.target as HTMLTextAreaElement).value)
        }
        placeholder="feat: describe your changes..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !disabled) {
            e.preventDefault();
            onCommit();
          }
        }}
      />

      <VSCodeTextArea
        className="!h-[80px] !min-h-[80px] !bg-vscode-input-background !text-vscode-input-foreground"
        value={detail}
        onChange={(e) =>
          onDetailChange((e.target as HTMLTextAreaElement).value)
        }
        placeholder="Detailed description of your changes (optional)..."
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-vscode-descriptionForeground">
          {selectedFilesCount} files selected
        </span>
        <VSCodeButton
          appearance="primary"
          onClick={onCommit}
          disabled={disabled}
        >
          Commit Changes
        </VSCodeButton>
      </div>
    </div>
  );
}
