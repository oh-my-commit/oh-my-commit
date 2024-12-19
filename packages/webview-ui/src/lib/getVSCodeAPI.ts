import { WebviewApi } from "vscode-webview";

let vscodeApi: WebviewApi<unknown> | undefined;

export function getVSCodeAPI(): WebviewApi<unknown> {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}
