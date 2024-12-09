import {
  VSCodeTextArea,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
import React from "react";

export const MessageInput = ({
  value,
  maxLength,
  placeholder,
  onChange,
  onEnter,
  className,
  multiline = false,
}: {
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  className?: string;
  multiline?: boolean;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="relative group">
      <style>
        {`
          .message-textarea::part(control) {
            min-height: 120px;
            resize: vertical;
            overflow-y: auto;
          }
        `}
      </style>
      {multiline ? (
        <VSCodeTextArea
          className={cn("w-full message-textarea", className)}
          value={value}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const newValue = (e.target as HTMLTextAreaElement).value;
            if (newValue.length <= maxLength) {
              onChange(newValue);
            }
          }}
        />
      ) : (
        <VSCodeTextField
          className={cn("w-full", className)}
          value={value}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const newValue = (e.target as HTMLInputElement).value;
            if (newValue.length <= maxLength) {
              onChange(newValue);
            }
          }}
        />
      )}
      <div className="absolute right-2 bottom-1 text-[10px] text-[var(--vscode-descriptionForeground)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};
