/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { PropsWithChildren } from "react"

import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react"

export const ErrorLayout = (props: PropsWithChildren) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-2">
      <div className="codicon codicon-source-control !text-[48px] text-[var(--vscode-foreground)] opacity-40" />
      <VSCodeDivider />

      {props.children}
    </div>
  )
}
