/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { clientPush } from "@/clientPush"
import { useSettings } from "@/hooks/use-settings"
import type { CommitLanguage } from "@/state/atoms/settings"

export function CommitSettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { commitLanguage, updateCommitLanguage } = useSettings()

  useEffect(() => {
    if (isOpen) {
      // Request current settings from VSCode
      clientPush({
        type: "get-settings",
        data: {
          section: "git.commitLanguage",
        },
      })
    }
  }, [isOpen])

  const handleLanguageChange = (value: CommitLanguage) => {
    updateCommitLanguage(value)
    clientPush({
      type: "update-settings",
      data: {
        section: "git.commitLanguage",
        value,
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-[var(--vscode-editor-background)] opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)] rounded-md p-4 w-96">
        <h2 className="text-[var(--vscode-editor-foreground)] text-lg font-medium mb-4">
          Commit Settings
        </h2>
        <div className="mb-4">
          <label className="block text-[var(--vscode-editor-foreground)] mb-2">
            Commit Message Language
          </label>
          <select
            className="w-full p-2 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded"
            value={commitLanguage}
            onChange={(e) =>
              handleLanguageChange(e.target.value as CommitLanguage)
            }
          >
            <option value="system">System Default</option>
            <option value="zh_CN">中文</option>
            <option value="en_US">English</option>
          </select>
        </div>
        <div className="flex justify-end">
          <VSCodeButton appearance="secondary" onClick={onClose}>
            Close
          </VSCodeButton>
        </div>
      </div>
    </div>
  )
}
