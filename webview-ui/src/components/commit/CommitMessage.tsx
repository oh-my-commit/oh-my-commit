import React, { useState, useEffect, useRef } from "react";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import {
  COMMON_COMMIT_TYPES,
  EXTENDED_COMMIT_TYPES,
} from "../../constants/commitTypes";

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

const TypeBadge = ({
  type,
  onTypeChange,
}: {
  type: string;
  onTypeChange?: (type: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const commitType = [...COMMON_COMMIT_TYPES, ...EXTENDED_COMMIT_TYPES].find(
    (t) => t.value === type
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!commitType) return null;

  const handleFeedback = () => {
    setShowMenu(false);
    onTypeChange?.(type);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="px-2 py-1 text-[11px] rounded-sm inline-flex items-center gap-1.5 select-none hover:bg-[var(--vscode-badge-background)] group transition-colors"
        onClick={() => setShowMenu(!showMenu)}
        style={{
          backgroundColor: showMenu
            ? "var(--vscode-badge-background)"
            : "var(--vscode-badge-background)",
          color: "var(--vscode-badge-foreground)",
        }}
      >
        <span className="opacity-80">{commitType.label.split(" ")[0]}</span>
        <span className="font-medium">{type}</span>
        <span className="text-[8px] opacity-60 group-hover:opacity-100">▼</span>
      </button>

      {showMenu && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[200px] py-1 rounded-sm shadow-lg"
          style={{
            backgroundColor: "var(--vscode-input-background)",
            border: "1px solid var(--vscode-input-border)",
          }}
        >
          <div className="px-2 py-1.5 border-b border-[var(--vscode-input-border)]">
            <div className="text-xs font-medium mb-1">Current Type</div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)]">
              {commitType.description}
            </div>
          </div>
          <button
            className="w-full px-2 py-1.5 text-left text-[11px] hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-errorForeground)] flex items-center gap-2"
            onClick={handleFeedback}
          >
            <span>⚠️</span>
            <span>This type seems incorrect</span>
          </button>
        </div>
      )}
    </div>
  );
};

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
  const length = value.length;
  const isOverLimit = length > maxLength;

  if (!multiline) {
    return (
      <div className="relative">
        <VSCodeTextField
          value={value}
          onChange={(e) => onChange((e.target as HTMLInputElement).value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          className={className}
          style={
            {
              width: "100%",
              ...(isOverLimit
                ? {
                    "--vscode-inputValidation-errorBorder":
                      "var(--vscode-errorForeground)",
                  }
                : {}),
            } as React.CSSProperties
          }
        />
        <div
          className="absolute right-2 bottom-1.5 px-1 text-[10px] rounded"
          style={{
            color: isOverLimit
              ? "var(--vscode-inputValidation-errorForeground)"
              : "var(--vscode-descriptionForeground)",
            backgroundColor: "var(--vscode-input-background)",
            opacity: 0.8,
          }}
        >
          {length}/{maxLength}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={`w-full resize-none rounded-[3px] px-2 py-1 ${className}`}
        style={{
          backgroundColor: "var(--vscode-input-background)",
          border: `1px solid ${
            isOverLimit
              ? "var(--vscode-inputValidation-errorBorder)"
              : "var(--vscode-input-border)"
          }`,
          color: "var(--vscode-input-foreground)",
          outline: "none",
          fontFamily: "var(--vscode-font-family)",
          fontSize: "var(--vscode-font-size)",
          lineHeight: "var(--vscode-line-height)",
          minHeight: "60px",
          "&::placeholder": {
            color: "var(--vscode-input-placeholderForeground)",
            opacity: 0.5,
          },
        }}
      />
      <div
        className="absolute right-2 bottom-1.5 px-1 text-[10px] rounded"
        style={{
          color: isOverLimit
            ? "var(--vscode-inputValidation-errorForeground)"
            : "var(--vscode-descriptionForeground)",
          backgroundColor: "var(--vscode-input-background)",
          opacity: 0.8,
        }}
      >
        {length}/{maxLength}
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

const CommitFormatTooltip = () => (
  <div
    className="absolute z-50 p-1.5 text-[11px] rounded shadow-lg border border-[var(--vscode-widget-border)]"
    style={{
      backgroundColor: "var(--vscode-menu-background)",
      color: "var(--vscode-menu-foreground)",
      width: "240px",
      right: "-4px",
      top: "calc(100% + 4px)",
    }}
  >
    <div className="font-medium mb-1">Commit Message Format</div>
    <div className="space-y-0.5 opacity-90">
      <div className="flex gap-1.5">
        <span className="opacity-60">•</span>
        <span>First line: [type]: [concise description]</span>
      </div>
      <div className="flex gap-1.5">
        <span className="opacity-60">•</span>
        <span>Leave a blank line after the subject</span>
      </div>
      <div className="flex gap-1.5">
        <span className="opacity-60">•</span>
        <span>Detailed description: what, why, and how</span>
      </div>
      <div className="flex gap-1.5">
        <span className="opacity-60">•</span>
        <span>Use present tense ("add feature" not "added feature")</span>
      </div>
    </div>
  </div>
);

const TypeBadgeNew = ({ type }: { type: string }) => {
  const commitType = [...COMMON_COMMIT_TYPES, ...EXTENDED_COMMIT_TYPES].find(
    (t) => t.value === type
  );

  if (!commitType) return null;

  return (
    <div
      className="px-2 py-1 text-[11px] rounded-sm inline-flex items-center gap-1 select-none"
      style={{
        backgroundColor: "var(--vscode-badge-background)",
        color: "var(--vscode-badge-foreground)",
      }}
    >
      <span className="opacity-80">{commitType.label.split(" ")[0]}</span>
      <span className="font-medium">{type}</span>
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

  return (
    <section className="flex flex-col gap-3 bg-[var(--vscode-input-background)] p-3 rounded-sm border border-[var(--vscode-input-border)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium text-[var(--vscode-editor-foreground)]">
            Commit Message
          </h1>
          <div className="relative" ref={tooltipContainerRef}>
            <button
              className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <InfoIcon />
            </button>
            {showTooltip && <CommitFormatTooltip />}
          </div>
        </div>
      </div>

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

      <div className="flex items-center justify-between">
        {!isSubjectValid && subjectLength > 0 && (
          <span className="text-[11px] text-[var(--vscode-errorForeground)]">
            Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <FeedbackButton
            onFeedback={onFeedback}
            disabled={!message || disabled}
          />

          <VSCodeButton
            disabled={!isSubjectValid || disabled}
            onClick={onCommit}
          >
            Commit Changes
          </VSCodeButton>
        </div>
      </div>
    </section>
  );
}
