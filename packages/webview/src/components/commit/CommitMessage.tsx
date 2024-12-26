/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from "react"

import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { clientPush } from "@/clientPush"
import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip"
import { FeedbackButton } from "@/components/commit/feedback-button"
import { InfoIcon } from "@/components/commit/info-icon"
import { MessageInput } from "@/components/commit/message-input"
import { Section } from "@/components/layout/Section"
import { selectedFilesAtom } from "@/state/atoms/commit.changed-files"
import { commitBodyAtom, commitTitleAtom, isGeneratingAtom } from "@/state/atoms/commit.message"

const MAX_SUBJECT_LENGTH = 72
const MAX_DETAIL_LENGTH = 1000

export function CommitMessage() {
  const [title, setTitle] = useAtom(commitTitleAtom)
  const [body, setBody] = useAtom(commitBodyAtom)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom)
  const [selectedFiles, _setSelectedFiles] = useAtom(selectedFilesAtom)
  const tooltipContainerRef = useRef<HTMLDivElement>(null)
  const subjectLength = title.length
  const isSubjectValid = subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH
  const disabled = !title.trim()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 处理重新生成
  const handleRegenerate = () => {
    setIsGenerating(true)
    clientPush({
      channel: "commitMesage",
      type: "selected-files",
      data: selectedFiles,
    })
  }

  return (
    <Section
      actions={
        <div ref={tooltipContainerRef} className="relative">
          <button
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <InfoIcon />
          </button>
          {showTooltip && <CommitFormatTooltip />}
        </div>
      }
      title="Commit Message"
    >
      <Section.Content>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">Summary</div>
          <MessageInput
            className="h-[32px]"
            maxLength={MAX_SUBJECT_LENGTH}
            placeholder="Write a brief description of your changes"
            value={title}
            onChange={setTitle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">Details</div>
          <MessageInput
            multiline
            className="min-h-[120px]"
            maxLength={MAX_DETAIL_LENGTH}
            placeholder="Add a detailed description of your changes (optional)"
            value={body}
            onChange={setBody}
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
          disabled={disabled}
          onFeedback={() => {
            // todo: feedback
          }}
        />

        <div className="flex items-center gap-2 shrink-0">
          <VSCodeButton
            appearance="icon"
            className="p-1"
            disabled={isGenerating}
            title="Regenerate commit message"
            onClick={handleRegenerate}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
              <path
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                fillRule="evenodd"
              />
            </svg>
          </VSCodeButton>

          <VSCodeButton
            appearance="primary"
            className="w-40 shrink-0 overflow-hidden"
            disabled={isGenerating || !isSubjectValid || disabled}
            onClick={() => {
              // todo: commit
            }}
          >
            {isGenerating ? (
              <span className="w-full flex items-center justify-center gap-2">
                <VSCodeProgressRing className="w-4 h-4 [--progress-background:white]" />
                Generating...
              </span>
            ) : (
              "Commit Changes"
            )}
          </VSCodeButton>
        </div>
      </Section.Footer>
    </Section>
  )
}
