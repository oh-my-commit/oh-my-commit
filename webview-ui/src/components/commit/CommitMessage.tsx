import React, { useState, useEffect, useRef } from "react";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";

const COMMIT_TYPES = [
  { value: "feat", label: "✨ feat", description: "A new feature" },
  { value: "fix", label: "🐛 fix", description: "A bug fix" },
  {
    value: "docs",
    label: "📚 docs",
    description: "Documentation only changes",
  },
  {
    value: "style",
    label: "💎 style",
    description: "Changes that do not affect the meaning of the code",
  },
  {
    value: "refactor",
    label: "♻️ refactor",
    description: "A code change that neither fixes a bug nor adds a feature",
  },
  {
    value: "perf",
    label: "⚡️ perf",
    description: "A code change that improves performance",
  },
  {
    value: "test",
    label: "🧪 test",
    description: "Adding missing tests or correcting existing tests",
  },
  {
    value: "build",
    label: "🛠 build",
    description:
      "Changes that affect the build system or external dependencies",
  },
  {
    value: "ci",
    label: "👷 ci",
    description: "Changes to our CI configuration files and scripts",
  },
  {
    value: "chore",
    label: "🔧 chore",
    description: "Other changes that don't modify src or test files",
  },
];

const MAX_SUBJECT_LENGTH = 72;
const MAX_DETAIL_LENGTH = 1000;

interface CommitMessageProps {
  message: string;
  detail: string;
  onMessageChange: (message: string) => void;
  onDetailChange: (detail: string) => void;
  onCommit: () => void;
  selectedFilesCount: number;
  disabled?: boolean;
}

const TypeSelector = ({
  selectedType,
  onSelect,
}: {
  selectedType: string;
  onSelect: (type: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative select-none">
      <div
        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[var(--vscode-input-foreground)]">
          {COMMIT_TYPES.find((t) => t.value === selectedType)?.label}
        </span>
        <span className="text-xs opacity-60">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div
            className="absolute z-50 w-full mt-1 overflow-hidden border rounded-md shadow-lg border-[var(--vscode-input-border)]"
            style={{ backgroundColor: "var(--vscode-input-background)" }}
          >
            {COMMIT_TYPES.map((type) => (
              <div
                key={type.value}
                className="flex flex-col px-2 py-1.5 cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)]"
                onClick={() => {
                  onSelect(type.value);
                  setIsOpen(false);
                }}
              >
                <span className="text-[var(--vscode-input-foreground)]">
                  {type.label}
                </span>
                <span className="text-xs text-[var(--vscode-descriptionForeground)]">
                  {type.description}
                </span>
              </div>
            ))}
          </div>
        </>
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

export function CommitMessage({
  message,
  detail,
  onMessageChange,
  onDetailChange,
  onCommit,
  selectedFilesCount,
  disabled,
}: CommitMessageProps) {
  const [selectedType, setSelectedType] = useState("feat");
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const subjectLength = message.length;
  const isSubjectValid =
    subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-medium text-[var(--vscode-editor-foreground)]">
          Commit Message
        </h1>
        <div className="relative" ref={tooltipContainerRef}>
          <button
            className="flex items-center justify-center w-4 h-4 rounded hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <InfoIcon />
          </button>
          {showTooltip && <CommitFormatTooltip />}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm text-[var(--vscode-descriptionForeground)]">
            Summary
          </h2>
          <MessageInput
            value={message}
            maxLength={MAX_SUBJECT_LENGTH}
            placeholder="Write a brief description of your changes"
            onChange={onMessageChange}
            className="h-[32px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-sm text-[var(--vscode-descriptionForeground)]">
            Details
          </h2>
          <MessageInput
            value={detail}
            maxLength={MAX_DETAIL_LENGTH}
            placeholder="Add a detailed description of your changes (optional)"
            onChange={onDetailChange}
            className="min-h-[120px]"
            multiline
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
            {!isSubjectValid && subjectLength > 0 && (
              <span className="text-[11px] text-[var(--vscode-errorForeground)]">
                Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
              </span>
            )}
          </div>

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
