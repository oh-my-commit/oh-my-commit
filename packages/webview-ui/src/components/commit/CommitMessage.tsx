import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip";
import { FeedbackButton } from "@/components/commit/feedback-button";
import { InfoIcon } from "@/components/commit/info-icon";
import { MessageInput } from "@/components/commit/message-input";
import { Section } from "@/components/layout/Section";
import { logger } from "@/lib/logger";
import { getVSCodeAPI } from "@/lib/storage";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";

const MAX_SUBJECT_LENGTH = 72;
const MAX_DETAIL_LENGTH = 1000;

export function CommitMessage() {
  const [title, setTitle] = useAtom(commitTitleAtom);
  const [body, setBody] = useAtom(commitBodyAtom);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const subjectLength = title.length;
  const isSubjectValid =
    subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;
  const disabled = !title.trim();

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
            value={title}
            maxLength={MAX_SUBJECT_LENGTH}
            placeholder="Write a brief description of your changes"
            onChange={setTitle}
            className="h-[32px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">
            Details
          </div>
          <MessageInput
            value={body}
            maxLength={MAX_DETAIL_LENGTH}
            placeholder="Add a detailed description of your changes (optional)"
            onChange={setBody}
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
        <FeedbackButton
          onFeedback={() => {
            // todo: feedback
          }}
          disabled={disabled}
        />
        <div className="flex gap-2">
          <VSCodeButton
            appearance="secondary"
            onClick={() => {
              const vscode = getVSCodeAPI();
              logger.info("Sending get-commit-data message");
              vscode.postMessage({ command: "get-commit-data" });
              logger.info("Message sent");
            }}
          >
            Regenerate
          </VSCodeButton>
          <VSCodeButton
            disabled={!isSubjectValid || disabled}
            onClick={() => {
              // todo: commit
            }}
          >
            Commit Changes
          </VSCodeButton>
        </div>
      </Section.Footer>
    </Section>
  );
}
