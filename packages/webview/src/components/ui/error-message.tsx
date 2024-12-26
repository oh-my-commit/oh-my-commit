/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { PropsWithChildren } from "react"

interface ErrorMessageProps extends PropsWithChildren {
  icon?: boolean
}

export function ErrorMessage({ children, icon = false }: ErrorMessageProps) {
  if (!children) return null

  return (
    <span className="text-xs text-[var(--vscode-errorForeground)] flex items-center gap-1">
      {icon && <i className="codicon codicon-error" />}
      {children}
    </span>
  )
}
