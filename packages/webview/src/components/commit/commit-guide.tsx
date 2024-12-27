/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState } from "react"

import Markdown from "marked-react"
import { outdent } from "outdent"

export const CommitGuide = () => {
  const [markdown, setMarkdown] = useState(outdent`
    # Commit Specification

    ## Format

    Commit messages should follow this format:

    \`\`\`
    <type>[optional scope]: <description>

    [optional body]

    [optional footer(s)]
    \`\`\`

    Where:
    - \`<type>\`: The type of change (see Types section below)
    - \`[optional scope]\`: The scope of the change (e.g., component or file name)
    - \`<description>\`: A short description of the change
    - \`[optional body]\`: A detailed description of the changes
    - \`[optional footer(s)]\`: Any breaking changes or issue references

    ## Types

    - \`feat\`: A new feature
    - \`fix\`: A bug fix
    - \`docs\`: Documentation only changes
    - \`style\`: Changes that do not affect the meaning of the code
    - \`refactor\`: A code change that neither fixes a bug nor adds a feature
    - \`perf\`: A code change that improves performance
    - \`test\`: Adding missing or correcting existing tests
    - \`build\`: Changes that affect the build system or dependencies
    - \`ci\`: Changes to CI configuration files and scripts
    - \`chore\`: Other changes that don't modify src or test files
    - \`revert\`: Reverts a previous commit

    [Learn more about Conventional Commits](https://www.conventionalcommits.org)
  `)

  const renderer = {
    code(code: string, language: string) {
      return (
        <div key={`${language}-${code.slice(0, 20)}`} className="code-block">
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
      className="absolute right-0 top-full mt-1 z-50 w-[240px] xs:w-[360px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]"
      style={{ pointerEvents: "auto" }}
    >
      <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3 markdown-content">
        <Markdown renderer={renderer} value={markdown} />

        <div className="pt-2 border-t border-[var(--vscode-widget-border)]">
          <a
            className="inline-flex items-center gap-1 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:underline"
            href="https://www.conventionalcommits.org"
            rel="noopener noreferrer"
            target="_blank"
            onClick={(e) => {
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
