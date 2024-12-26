/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { WebviewApi } from "vscode-webview"

// 在全局保存 vscode api 实例
declare global {
  interface Window {
    _vscodeApi: WebviewApi<unknown> | undefined
  }
}

export function getVSCodeAPI(): WebviewApi<unknown> {
  if (!window._vscodeApi) {
    window._vscodeApi = acquireVsCodeApi()
  }
  return window._vscodeApi
}
