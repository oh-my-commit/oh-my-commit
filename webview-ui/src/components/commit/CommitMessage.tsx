import React, { useState, useEffect, useRef } from "react";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { COMMON_COMMIT_TYPES, EXTENDED_COMMIT_TYPES } from "../../constants/commitTypes";

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

const TypeBadge = ({
  type,
  label,
  description,
  isSelected,
  onClick,
}: {
  type: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <button
        className={`
          px-2 py-1 text-[11px] rounded-sm transition-all duration-150 ease-in-out
          ${isSelected 
            ? "bg-[var(--vscode-toolbar-activeBackground)] text-[var(--vscode-foreground)] font-medium" 
            : "text-[var(--vscode-descriptionForeground)] hover:text-[var(--vscode-foreground)]"
          }
          hover:bg-[var(--vscode-toolbar-hoverBackground)]
        `}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
      </button>
      {showTooltip && (
        <div
          className="absolute z-50 p-2 text-xs rounded-sm shadow-lg whitespace-nowrap top-full left-1/2 transform -translate-x-1/2 mt-1.5 min-w-[200px]"
          style={{
            backgroundColor: "var(--vscode-input-background)",
            border: "1px solid var(--vscode-input-border)",
          }}
        >
          <div className="font-medium mb-1">{label}</div>
          <div className="text-[var(--vscode-descriptionForeground)]">{description}</div>
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

export function CommitMessage({
  message,
  detail,
  selectedFilesCount,
  onMessageChange,
  onDetailChange,
  onCommit,
  disabled,
}: CommitMessageProps) {
  const [selectedType, setSelectedType] = useState<string>("feat");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const subjectLength = message.length;
  const isSubjectValid =
    subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowExtended(false);
  };

  return (
    <section className="flex flex-col gap-3">
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
        <div className="text-xs text-[var(--vscode-descriptionForeground)]">
          {selectedFilesCount} file{selectedFilesCount !== 1 ? "s" : ""} selected
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-[var(--vscode-input-background)] p-3 rounded-sm border border-[var(--vscode-input-border)]">
        <div>
          <div className="text-xs font-medium mb-2 text-[var(--vscode-input-foreground)]">
            Type
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {COMMON_COMMIT_TYPES.map((type) => (
              <TypeBadge
                key={type.value}
                type={type.value}
                label={type.label}
                description={type.description}
                isSelected={selectedType === type.value}
                onClick={() => handleTypeSelect(type.value)}
              />
            ))}
            <button
              className={`
                px-2 py-1 text-[11px] rounded-sm transition-all duration-150 ease-in-out
                text-[var(--vscode-descriptionForeground)] hover:text-[var(--vscode-foreground)]
                hover:bg-[var(--vscode-toolbar-hoverBackground)]
                ${showExtended ? "bg-[var(--vscode-toolbar-activeBackground)] text-[var(--vscode-foreground)]" : ""}
              `}
              onClick={() => setShowExtended(!showExtended)}
            >
              {showExtended ? "Less ▲" : "More ▼"}
            </button>
          </div>
          {showExtended && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EXTENDED_COMMIT_TYPES.map((type) => (
                <TypeBadge
                  key={type.value}
                  type={type.value}
                  label={type.label}
                  description={type.description}
                  isSelected={selectedType === type.value}
                  onClick={() => handleTypeSelect(type.value)}
                />
              ))}
            </div>
          )}
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
      </div>

      <div className="flex items-center justify-end gap-2">
        {!isSubjectValid && subjectLength > 0 && (
          <span className="text-[11px] text-[var(--vscode-errorForeground)]">
            Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
          </span>
        )}

        <VSCodeButton
          disabled={!isSubjectValid || disabled}
          onClick={onCommit}
        >
          Commit Changes
        </VSCodeButton>
      </div>
    </section>
  );
}
