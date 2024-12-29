/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

interface EmptyStateProps {
  searchQuery?: string
  onClearSearch?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  onClearSearch,
}) => {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]">
        <i className="codicon codicon-search text-3xl mb-4 opacity-50" />
        <p className="mb-4">No files found matching {`"${searchQuery}"`}</p>
        <button
          className="px-3 py-1 text-sm rounded-sm bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]"
          onClick={onClearSearch}
        >
          Clear Search
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]">
      <i className="codicon codicon-git-commit text-3xl mb-4 opacity-50" />
      <p>No files have been changed</p>
    </div>
  )
}
