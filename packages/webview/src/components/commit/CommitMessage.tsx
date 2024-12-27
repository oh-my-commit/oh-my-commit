/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect, useRef, useState } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"

import { clientPush } from "@/clientPush"
import { CommitGuide } from "@/components/commit/commit-guide"
// todo: integrate feedbackv
// import { FeedbackButton } from "@/components/commit/feedback-button"
import { InfoIcon } from "@/components/commit/info-icon"
import { MessageInput } from "@/components/commit/message-input"
import { Section } from "@/components/layout/Section"
import { ErrorMessage } from "@/components/ui/error-message"
import {
  commitBodyAtom,
  commitTitleAtom,
  isCommittingAtom,
  isGeneratingAtom,
} from "@/state/atoms/commit.message"

const MAX_SUBJECT_LENGTH = 72
const MAX_DETAIL_LENGTH = 1000

export function CommitMessage() {
  const [title, setTitle] = useAtom(commitTitleAtom)
  const [body, setBody] = useAtom(commitBodyAtom)
  const [showCommitGuide, setShowCommitGuide] = useState(false)
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom)
  const [isCommitting, setIsCommitting] = useAtom(isCommittingAtom)

  const tooltipContainerRef = useRef<HTMLDivElement>(null)
  const subjectLength = title.length
  const isSubjectValid =
    subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH
  const disabled = !title.trim()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowCommitGuide(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRegenerate = () => {
    setIsGenerating(true)
    clientPush({
      type: "regenerate-commit",
      data: {
        requestStagedFiles: true,
      },
    })
  }

  const handleCommit = () => {
    if (!title.trim()) return

    // Show loading state
    setIsCommitting(true)

    // Send commit request to extension
    clientPush({
      type: "commit",
      data: {
        title: title.trim(),
        body: body.trim(),
      },
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !disabled) {
        handleCommit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, title, body])

  return (
    <Section
      actions={
        <div ref={tooltipContainerRef} className="relative">
          <button
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
            onClick={() => setShowCommitGuide(!showCommitGuide)}
          >
            <InfoIcon />
          </button>
          {showCommitGuide && <CommitGuide />}
        </div>
      }
      title="Commit Message"
    >
      <Section.Content>
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)]">
            Summary
          </div>
          <MessageInput
            className="h-[32px]"
            maxLength={MAX_SUBJECT_LENGTH}
            placeholder="Write a brief description of your changes"
            value={title}
            onChange={setTitle}
          />
          {!isSubjectValid && subjectLength > 0 && (
            <ErrorMessage>
              Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
            </ErrorMessage>
          )}
          <div className="text-xs font-medium text-[var(--vscode-input-foreground)] mt-2">
            Description
          </div>
          <MessageInput
            className="h-[120px]"
            maxLength={MAX_DETAIL_LENGTH}
            placeholder="Add a more detailed description (optional)"
            value={body}
            onChange={setBody}
            multiline
          />
          <div className="flex justify-between items-center mt-4 gap-2">
            <div className="flex items-center gap-2">
              <VSCodeButton
                appearance="secondary"
                disabled={isGenerating}
                onClick={handleRegenerate}
              >
                Regenerate
              </VSCodeButton>
              {/* <FeedbackButton /> */}
            </div>
            <VSCodeButton
              disabled={disabled || isGenerating || isCommitting}
              onClick={handleCommit}
            >
              {isCommitting ? "Committing..." : "Commit Changes"}
            </VSCodeButton>
          </div>
        </div>
      </Section.Content>
    </Section>
  )
}
