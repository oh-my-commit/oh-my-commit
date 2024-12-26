/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from "react"

export type FeedbackType =
  | "format" // 格式问题（如不符合约定、风格不一致等）
  | "scope" // 范围问题（如遗漏了某些改动、包含了不相关改动等）
  | "clarity" // 清晰度问题（如描述不清、用词不准确等）
  | "language" // 语言问题（如语法、拼写或语言问题）
  | "other" // 其他问题

export const FeedbackButton = ({
  onFeedback,
  disabled,
}: {
  onFeedback?: (type: FeedbackType, details?: string) => void
  disabled?: boolean
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [hasFeedback, setHasFeedback] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFeedback = (type: FeedbackType) => {
    onFeedback?.(type)
    setShowMenu(false)
    setHasFeedback(true)
  }

  const feedbackOptions: {
    type: FeedbackType
    label: string
    description: string
    icon: JSX.Element
  }[] = [
    {
      type: "format",
      label: "Format Issue",
      description: "Wrong format or style",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3 4h10v1.5H3V4zm0 3h8v1.5H3V7zm0 3h10v1.5H3V10z" fillRule="evenodd" />
        </svg>
      ),
    },
    {
      type: "scope",
      label: "Scope Issue",
      description: "Wrong scope or missing scope",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 3.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2.5 8a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
            fillRule="evenodd"
          />
          <path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
        </svg>
      ),
    },
    {
      type: "clarity",
      label: "Clarity Issue",
      description: "Message is unclear or hard to understand",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 4.5c2 0 3.75 1.25 4.5 2.5-.75 1.25-2.5 2.5-4.5 2.5S4.25 8.25 3.5 7C4.25 5.75 6 4.5 8 4.5zm0 1.5a1 1 0 100 2 1 1 0 000-2z"
            fillRule="evenodd"
          />
        </svg>
      ),
    },
    {
      type: "language",
      label: "Language Issue",
      description: "Grammar, spelling, or language problems",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 3L4.5 11h1.75l.875-2h2.75l.875 2H12.5L9 3H8zm-.875 4.5L8 4.5l.875 3h-1.75z"
            fillRule="evenodd"
          />
          <path d="M4.5 12h7v1h-7z" />
        </svg>
      ),
    },
    {
      type: "other",
      label: "Other Issue",
      description: "Other improvement suggestions",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 3.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2.5 8a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
            fillRule="evenodd"
          />
          <path d="M8 5.5h.01v3H8v-3zm0 4h.01v1H8v-1z" />
        </svg>
      ),
    },
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        className={`w-8 h-8 flex items-center justify-center px-3 py-1 text-xs rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${
          disabled || hasFeedback
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)]"
        }`}
        disabled={disabled || hasFeedback}
        title={
          hasFeedback ? "Feedback already submitted" : "Provide feedback on this commit message"
        }
        onClick={() => !disabled && !hasFeedback && setShowMenu(!showMenu)}
      >
        <span className="block sm:hidden">
          <i className="codicon codicon-feedback" />
        </span>

        <span className="hidden sm:block text-sm">
          {hasFeedback ? "Thanks for your feedback" : "Improve"}
        </span>

        {hasFeedback && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
              fillRule="evenodd"
            />
          </svg>
        )}
      </button>

      {showMenu && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-[280px] py-1 rounded-sm shadow-lg"
          style={{
            backgroundColor: "var(--vscode-input-background)",
            border: "1px solid var(--vscode-input-border)",
          }}
        >
          <div className="px-3 py-2 border-b border-[var(--vscode-input-border)]">
            <div className="text-sm font-medium text-[var(--vscode-foreground)]">Feedback Type</div>
            <div className="text-xs opacity-80 mt-0.5 text-[var(--vscode-foreground)]">
              What would you like to improve?
            </div>
          </div>
          <div className="py-1">
            {feedbackOptions.map(({ type, label, description, icon }) => (
              <button
                key={type}
                className="w-full px-3 py-1.5 text-left hover:bg-[var(--vscode-list-hoverBackground)] transition-colors flex items-start gap-2 text-[var(--vscode-foreground)]"
                onClick={() => handleFeedback(type)}
              >
                <div className="mt-1 opacity-90">{icon}</div>
                <div>
                  <div className="text-sm">{label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
