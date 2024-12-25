import { clientPush } from "@/clientPush"
import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip"
import { FeedbackButton } from "@/components/commit/feedback-button"
import { InfoIcon } from "@/components/commit/info-icon"
import { MessageInput } from "@/components/commit/message-input"
import { Section } from "@/components/layout/Section"
import { selectedFilesAtom } from "@/state/atoms/commit.changed-files"
import { commitBodyAtom, commitTitleAtom, isGeneratingAtom } from "@/state/atoms/commit.message"
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"
import { useAtom } from "jotai"
import { useEffect, useRef, useState } from "react"

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
        <div className="flex items-center gap-4 shrink-0">
          <VSCodeButton
            appearance="secondary"
            className="w-32 shrink-0 overflow-hidden"
            disabled={isGenerating}
            onClick={handleRegenerate}
          >
            {isGenerating ? (
              <span className="w-full flex items-center gap-2">
                <VSCodeProgressRing className="w-4 h-4 " />
              </span>
            ) : (
              "Regenerate2"
            )}
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
  )
}
