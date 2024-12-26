/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"

interface HighlightTextProps {
  text: string
  highlight: string
  className?: string
  onMatchCount?: (count: number) => void
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className,
  onMatchCount,
}) => {
  React.useEffect(() => {
    if (!highlight?.trim()) {
      onMatchCount?.(0)
      return
    }
    try {
      const parts = text.split(new RegExp(`(${highlight})`, "gi"))
      const matchCount = (parts.length - 1) / 2
      onMatchCount?.(matchCount)
    } catch (error) {
      console.warn("Error calculating highlight matches:", error)
      onMatchCount?.(0)
    }
  }, [text, highlight, onMatchCount])

  if (!highlight?.trim()) {
    return <span className={className}>{text}</span>
  }

  try {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"))
    return (
      <span className={className}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight?.toLowerCase() ? (
            <span key={i} className="relative">
              <span className="relative z-10 font-semibold">{part}</span>
              <span
                className="absolute inset-0 bg-yellow-500/30 dark:bg-yellow-400/40 rounded-sm"
                style={{ margin: "-1px -2px", padding: "1px 2px" }}
              />
            </span>
          ) : (
            part
          )
        )}
      </span>
    )
  } catch (error) {
    console.warn("Error rendering highlighted text:", error)
    return <span className={className}>{text}</span>
  }
}
