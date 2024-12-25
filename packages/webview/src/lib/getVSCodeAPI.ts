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
