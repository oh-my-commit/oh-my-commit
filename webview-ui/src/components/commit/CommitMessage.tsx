import React, { useState, useEffect, useRef } from "react";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeTextField,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react";
import {
  COMMON_COMMIT_TYPES,
  EXTENDED_COMMIT_TYPES,
} from "../../constants/commitTypes";
import { Section } from "../layout/Section";
import cn from "classnames";
import Markdown from "marked-react";
import { loadMarkdown } from "../../utils/loadMarkdown";

const MAX_SUBJECT_LENGTH = 72;
const MAX_DETAIL_LENGTH = 1000;

interface CommitMessageProps {
  message: string;
  detail: string;
  selectedFilesCount: number;
  commitType?: string;
  onMessageChange: (value: string) => void;
  onDetailChange: (value: string) => void;
  onCommit: () => void;
  onFeedback?: (
    type: "type" | "content" | "regenerate" | "other",
    details?: string
  ) => void;
  disabled?: boolean;
}

const MessageInput = ({
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

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M7.5 1a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 12a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm.5-9H7v1h1V4zm0 2H7v5h1V6z" />
  </svg>
);

const CommitFormatTooltip = () => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const content = loadMarkdown("commit-format");
    setMarkdown(content);
  }, []);

  const renderer = {
    code(code: string, language: string) {
      return (
        <div className="code-block" key={`${language}-${code.slice(0, 20)}`}>
          <div className="code-block-header">{language || "text"}</div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    },
  };

  return (
    <div
      className="absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]"
      style={{ pointerEvents: "auto" }}
    >
      <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3 markdown-content">
        <Markdown value={markdown} renderer={renderer} />
        <div className="pt-2 border-t border-[var(--vscode-widget-border)]">
          <a
            href="https://www.conventionalcommits.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              const vscode = acquireVsCodeApi();
              vscode.postMessage({
                command: "openUrl",
                data: "https://www.conventionalcommits.org",
              });
            }}
          >
            Learn more about Conventional Commits
            <i className="codicon codicon-link-external text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

const FeedbackButton = ({
  onFeedback,
  disabled,
}: {
  onFeedback?: (
    type: "type" | "content" | "regenerate" | "other",
    details?: string
  ) => void;
  disabled?: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFeedback = (
    type: "type" | "content" | "regenerate" | "other"
  ) => {
    onFeedback?.(type);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`px-4 py-[6px] text-sm rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
        } text-[var(--vscode-descriptionForeground)]`}
        onClick={() => !disabled && setShowMenu(!showMenu)}
        disabled={disabled}
      >
        <span>Improve</span>
      </button>

      {showMenu && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[240px] py-1 rounded-sm shadow-lg"
          style={{
            backgroundColor: "var(--vscode-input-background)",
            border: "1px solid var(--vscode-input-border)",
          }}
        >
          <div className="px-3 py-2 border-b border-[var(--vscode-input-border)]">
            <div className="text-xs font-medium mb-1">Suggest Improvements</div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)]">
              Help AI generate better commit messages
            </div>
          </div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("type")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>🏷️</span>
              <span>Incorrect Commit Type</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              The selected type doesn't match the changes
            </div>
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("content")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>📝</span>
              <span>Enhance Message</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Message could be clearer or more descriptive
            </div>
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("regenerate")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>🔄</span>
              <span>Regenerate Message</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Start over with a new commit message
            </div>
          </button>
          <div className="border-t border-[var(--vscode-input-border)] my-1"></div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("other")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>💡</span>
              <span>Provide Other Feedback</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Share additional suggestions or concerns
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export function CommitMessage({
  message,
  detail,
  selectedFilesCount,
  commitType = "feat",
  onMessageChange,
  onDetailChange,
  onCommit,
  onFeedback,
  disabled,
}: CommitMessageProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const subjectLength = message.length;
  const isSubjectValid =
    subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Section
      title="Commit Message"
      actions={
        <div className="relative" ref={tooltipContainerRef}>
          <button
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <InfoIcon />
          </button>
          {showTooltip && <CommitFormatTooltip />}
        </div>
      }
    >
      <Section.Content>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">
            Summary
          </div>
          <MessageInput
            value={message}
            maxLength={MAX_SUBJECT_LENGTH}
            placeholder="Write a brief description of your changes"
            onChange={onMessageChange}
            className="h-[32px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">
            Details
          </div>
          <MessageInput
            value={detail}
            maxLength={MAX_DETAIL_LENGTH}
            placeholder="Add a detailed description of your changes (optional)"
            onChange={onDetailChange}
            className="min-h-[120px]"
            multiline
          />
        </div>
      </Section.Content>

      <Section.Footer>
        {!isSubjectValid && subjectLength > 0 && (
          <span className="text-[11px] text-[var(--vscode-errorForeground)]">
            Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
          </span>
        )}
        <FeedbackButton onFeedback={onFeedback} disabled={disabled} />
        <VSCodeButton disabled={!isSubjectValid || disabled} onClick={onCommit}>
          Commit Changes
        </VSCodeButton>
      </Section.Footer>
    </Section>
  );
}
