/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { WebviewApi } from "vscode-webview"

let vscodeApi: WebviewApi<unknown> | undefined

export function getVSCodeAPI(): WebviewApi<unknown> {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi()
  }
  return vscodeApi
}
