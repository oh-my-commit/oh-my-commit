/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from "react"
import { createPortal } from "react-dom"

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

  const panel = (
    <div
      className={`fixed right-0 top-0 bottom-0 w-72 bg-[var(--vscode-editor-background)] border-l border-[var(--vscode-panel-border)] transform transition-transform duration-300 ease-in-out overflow-hidden shadow-lg ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        position: 'fixed',  // 强制使用固定定位
        zIndex: 2147483647,  // 使用最大可能的 z-index
        willChange: 'transform',  // 优化动画性能
      }}
    >
      <div className="h-full flex flex-col">
        <div className="flex-none p-3 border-b border-[var(--vscode-panel-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--vscode-editor-foreground)] text-base font-medium">
              Commit Settings
            </h2>
            <VSCodeButton appearance="secondary" onClick={onClose}>
              Close
            </VSCodeButton>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--vscode-editor-foreground)] text-sm mb-2">
                Commit Message Language
              </label>
              <select
                className="w-full p-2 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded text-sm"
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
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
