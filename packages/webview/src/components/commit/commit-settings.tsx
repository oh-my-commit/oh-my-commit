/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect, useRef } from "react"
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
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 检查点击源是否是设置按钮或其子元素
      const target = event.target as Element;
      if (target.closest('vscode-button[title="Settings"]')) {
        return;
      }

      // 检查点击源是否在面板外
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      // 使用 setTimeout 确保事件处理器在按钮点击事件之后执行
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose])

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
      ref={panelRef}
      className={`fixed right-0 top-0 bottom-0 w-72 bg-[var(--vscode-editor-background)] border-l border-[var(--vscode-panel-border)] transform transition-transform duration-200 ease-out overflow-hidden shadow-lg ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        position: "fixed",
        zIndex: 2147483647,
        willChange: "transform",
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
