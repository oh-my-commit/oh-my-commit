import { useEffect, useState } from "react"

import Markdown from "marked-react"

import { loadMarkdown } from "@/utils/loadMarkdown"

export const CommitFormatTooltip = () => {
  const [markdown, setMarkdown] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const content = await loadMarkdown("commit-specification")
        setMarkdown(content)
      } catch (error) {
        console.error("Failed to load markdown:", error)
        setMarkdown("Failed to load commit format guide. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMarkdown()
  }, [])

  const renderer = {
    code(code: string, language: string) {
      return (
        <div className="code-block" key={`${language}-${code.slice(0, 20)}`}>
          <div className="code-block-header">{language || "text"}</div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )
    },
    html(html: string) {
      // Skip HTML comments
      if (html.startsWith("<!--") && html.endsWith("-->")) {
        return null
      }
      return html
    },
  }

  return (
    <div
      className="absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]"
      style={{ pointerEvents: "auto" }}
    >
      <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3 markdown-content">
        {loading ? <div>Loading...</div> : <Markdown value={markdown} renderer={renderer} />}
        <div className="pt-2 border-t border-[var(--vscode-widget-border)]">
          <a
            href="https://www.conventionalcommits.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:underline"
            onClick={e => {
              e.preventDefault()
              const vscode = acquireVsCodeApi()
              vscode.postMessage({
                command: "openUrl",
                data: "https://www.conventionalcommits.org",
              })
            }}
          >
            Learn more about Conventional Commits
            <i className="codicon codicon-link-external text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  )
}
