/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react"
import { createRoot } from "react-dom/client"

import "@vscode/codicons/dist/codicon.css"
import { provideVSCodeDesignSystem, vsCodeProgressRing } from "@vscode/webview-ui-toolkit"

import { Provider } from "jotai"

import { CommitPage } from "./pages/commit.page"
import "./styles/global.css"
import "./styles/markdown.css"

// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeProgressRing())

const container = document.getElementById("root") as HTMLElement
if (!container) {
  console.error("Root element not found")
  throw new Error("Root element not found  ")
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <Provider>
      <CommitPage />
    </Provider>
  </React.StrictMode>
)
