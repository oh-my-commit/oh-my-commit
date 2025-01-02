/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect, useRef, useState } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { useAtom } from "jotai"
import { GitCommit, Heart, Info, RotateCw, Settings2 } from "lucide-react"

import { CommitGuide } from "@/components/commit/commit-guide"
import { InfoIcon } from "@/components/commit/info-icon"
import { MessageInput } from "@/components/commit/message-input"
import { Section } from "@/components/layout/Section"
import { ErrorMessage } from "@/components/ui/error-message"
import { cn } from "@/lib/utils"
import { commitBodyAtom, commitTitleAtom, isCommittingAtom, isGeneratingAtom } from "@/state/atoms/commit.message"
import "@/styles/theme-pink.css"
import { clientPush } from "@/utils/clientPush"

import { CommitSettingsDialog } from "./commit-settings"

const MAX_SUBJECT_LENGTH = 72
const MAX_DETAIL_LENGTH = 1000

export function CommitMessage() {
  const [title, setTitle] = useAtom(commitTitleAtom)
  const [body, setBody] = useAtom(commitBodyAtom)
  const [showCommitGuide, setShowCommitGuide] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom)
  const [isCommitting, setIsCommitting] = useAtom(isCommittingAtom)

  const tooltipContainerRef = useRef<HTMLDivElement>(null)
  const subjectLength = title.length
  const isSubjectValid = subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH
  const disabled = !title.trim()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipContainerRef.current && !tooltipContainerRef.current.contains(event.target as Node)) {
        setShowCommitGuide(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRegenerate = () => {
    setIsGenerating(true)
    clientPush({
      type: "generate",
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
    <div className="theme-pink">
      <div className="commit-card rounded-lg p-6 backdrop-blur-md relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--yt-primary)]" />
            <h2 className="text-xl font-semibold text-[var(--yt-dark)] tracking-wide">Commit Message</h2>
          </div>
          <div className="relative" ref={tooltipContainerRef}>
            <button
              className="icon-button p-2 rounded-full hover:bg-[rgba(157,78,221,0.1)]"
              onClick={() => setShowCommitGuide(!showCommitGuide)}
              title="View commit message guidelines"
            >
              <Info className="w-4 h-4" />
            </button>
            {showCommitGuide && <CommitGuide />}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--yt-dark)]">
                Summary
                <span className="ml-2 text-xs text-[var(--yt-primary)] bg-[rgba(157,78,221,0.1)] px-2 py-0.5 rounded-full">
                  {subjectLength}/{MAX_SUBJECT_LENGTH}
                </span>
              </label>
            </div>
            <MessageInput
              className={cn(
                "commit-input h-[40px] rounded-lg transition-all",
                !isSubjectValid && subjectLength > 0 && "border-[#e85d75] focus:border-[#e85d75]"
              )}
              maxLength={MAX_SUBJECT_LENGTH}
              placeholder="Write a brief description of your changes"
              value={title}
              onChange={setTitle}
            />
            {!isSubjectValid && subjectLength > 0 && (
              <ErrorMessage className="text-[#e85d75] mt-1">
                Subject must be ≤ {MAX_SUBJECT_LENGTH} characters
              </ErrorMessage>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yt-dark)] mb-2">Description</label>
            <MessageInput
              className="commit-input min-h-[120px] rounded-lg"
              maxLength={MAX_DETAIL_LENGTH}
              placeholder="Add a more detailed description (optional)"
              value={body}
              onChange={setBody}
              multiline
            />
          </div>

          <div className="flex justify-between items-center pt-4 gap-3">
            <div className="flex items-center gap-3">
              <button
                className={cn(
                  "commit-button px-4 py-2 rounded-full flex items-center gap-2 font-medium",
                  showSettings && "bg-[var(--yt-accent)]"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSettings(!showSettings)
                }}
                title="Settings"
              >
                <Settings2 className="w-4 h-4" />
                Settings
              </button>
              <button
                className="commit-button px-4 py-2 rounded-full flex items-center gap-2 font-medium"
                disabled={isGenerating}
                onClick={handleRegenerate}
                title="Regenerate commit message"
              >
                <RotateCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                Regenerate
              </button>
            </div>

            <button
              className="commit-button px-6 py-2 rounded-full flex items-center gap-2 font-medium"
              disabled={disabled || isCommitting}
              onClick={handleCommit}
              title="Create commit"
            >
              <GitCommit className="w-4 h-4" />
              {isCommitting ? "Committing..." : "Commit"}
            </button>
          </div>
        </div>

        {showSettings && <CommitSettingsDialog open={showSettings} onOpenChange={setShowSettings} />}
        <div className="yating-signature">Designed for Yating</div>
      </div>
    </div>
  )
}
