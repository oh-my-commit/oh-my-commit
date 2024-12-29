/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

import {
  VSCodeTextArea,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"

import cn from "classnames"

export const MessageInput = ({
  value,
  maxLength,
  placeholder,
  onChange,
  onEnter,
  className,
  multiline = false,
}: {
  value: string
  maxLength: number
  placeholder: string
  onChange: (value: string) => void
  onEnter?: () => void
  className?: string
  multiline?: boolean
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onEnter) {
      e.preventDefault()
      onEnter()
    }
  }

  return (
    <div className="relative group">
      <style>
        {`
          .message-textarea::part(control) {
            min-height: 120px;
            resize: vertical;
            overflow-y: auto;
            padding-bottom: 20px !important;
          }

          .message-textarea::part(control)::-webkit-scrollbar {
            width: 8px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 4px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-activeBackground);
          }

          .message-textarea::part(control)::-webkit-resizer {
            padding: 6px;
          }
        `}
      </style>
      {multiline ? (
        <VSCodeTextArea
          className={cn("w-full message-textarea", className)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const newValue = (e.target as HTMLTextAreaElement).value
            if (newValue.length <= maxLength) {
              onChange(newValue)
            }
          }}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <VSCodeTextField
          className={cn("w-full", className)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const newValue = (e.target as HTMLInputElement).value
            if (newValue.length <= maxLength) {
              onChange(newValue)
            }
          }}
          onKeyDown={handleKeyDown}
        />
      )}
      <div className="absolute right-2 bottom-2 text-[10px] text-[var(--vscode-descriptionForeground)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1 bg-[var(--vscode-editor-background)]">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}
