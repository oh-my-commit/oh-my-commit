import { useAtomValue } from "jotai"

import { progressAtom } from "@/state/atoms/progress"

export const Progress = () => {
  const { isVisible, message, percentage } = useAtomValue(progressAtom)

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-[var(--vscode-progressBar-background)]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: "var(--vscode-progressBar-foreground)",
          }}
        />
      </div>
      {message && (
        <div className="px-4 py-1 text-xs text-[var(--vscode-foreground)]">{message}</div>
      )}
    </div>
  )
}
