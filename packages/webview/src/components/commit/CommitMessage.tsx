/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { clientPush } from "@/clientPush"
import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip"
import { FeedbackButton } from "@/components/commit/feedback-button"
import { InfoIcon } from "@/components/commit/info-icon"
import { MessageInput } from "@/components/commit/message-input"
import { Section } from "@/components/layout/Section"
import { ErrorMessage } from "@/components/ui/error-message"
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

  const handleCommit = () => {
    // todo: commit
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
          {!isSubjectValid && subjectLength > 0 && (
            <ErrorMessage>Subject must be ≤ {MAX_SUBJECT_LENGTH} characters</ErrorMessage>
          )}
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
        <FeedbackButton
          disabled={disabled}
          onFeedback={() => {
            // todo: feedback
          }}
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            className={`px-1 py-1 text-xs rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${
              isGenerating
                ? "opacity-50 cursor-not-allowed animate-spin"
                : "hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)]"
            }`}
            disabled={isGenerating}
            title="Regenerate commit message"
            onClick={handleRegenerate}
          >
            <i className="codicon codicon-refresh" />
          </button>

          <VSCodeButton
            appearance="primary"
            className="shrink-0 w-fill inline-flex items-center justify-center gap-2 relative"
            disabled={!isSubjectValid || disabled || isGenerating}
            onClick={handleCommit}
          >
            <span className="w-full hidden xs:block text-center">Commit Changes</span>
            <span className="grow block xs:hidden">
              <i className="codicon codicon-git-commit" />
            </span>
          </VSCodeButton>
        </div>
      </Section.Footer>
    </Section>
  )
}
