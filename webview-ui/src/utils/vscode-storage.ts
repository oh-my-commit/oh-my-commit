import type { WebviewApi } from "vscode-webview";

let vscode: WebviewApi<unknown> | undefined;

export function getVSCodeAPI(): WebviewApi<unknown> {
  if (!vscode) {
    vscode = acquireVsCodeApi();
  }
  return vscode;
}

export function getStorageValue<T>(key: string, defaultValue: T): T {
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  return (state[key] as T) ?? defaultValue;
}

export function setStorageValue<T>(key: string, value: T): void {
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  vscode.setState({ ...state, [key]: value });
}
