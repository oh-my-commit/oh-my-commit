/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react"

import { APP_NAME } from "@shared/common"

import { getVSCodeAPI } from "@/lib/getVSCodeAPI"

import packageJson from "../../package.json"

interface FooterProps {
  className?: string
  children?: React.ReactNode
}

export const Footer: React.FC<FooterProps> = ({ className, children }) => {
  const vscode = getVSCodeAPI()

  const handleLinkClick = (url: string) => {
    vscode.postMessage({
      command: "openExternal",
      url,
    })
  }

  return (
    <footer
      className={`
        mt-auto
        flex flex-col items-center justify-center py-3
        border-t border-panel-border border-opacity-50
        ${className || ""}
      `}
    >
      <button
        onClick={() => handleLinkClick("https://github.com/cs-magic-open/oh-my-commit")}
        // className="text-xs font-normal text-editor-fg opacity-75 tracking-wider hover:text-vscode-textLink-foreground hover:opacity-90 transition-all duration-200"
      >
        <span className="mt-1 text-[9px] text-vscode-descriptionForeground opacity-40 font-light tracking-[0.15em] uppercase">
          {APP_NAME} {packageJson.version}
        </span>
      </button>
    </footer>
  )
}
