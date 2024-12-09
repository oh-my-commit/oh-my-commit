import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip";
import { FeedbackButton } from "@/components/commit/feedback-button";
import { InfoIcon } from "@/components/commit/info-icon";
import { MessageInput } from "@/components/commit/message-input";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import React, { useEffect, useRef, useState } from "react";
import { Section } from "@/components/layout/Section";

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
    details?: string,
  ) => void;
  disabled?: boolean;
}

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
