declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};

let vscode: ReturnType<typeof acquireVsCodeApi> | undefined;

export function getVSCodeAPI(): ReturnType<typeof acquireVsCodeApi> {
  if (!vscode) {
    vscode = acquireVsCodeApi();
  }
  return vscode;
}

export function getStorageValue<T>(key: string, defaultValue: T): T {
  const vscode = getVSCodeAPI();
  const state = (vscode.getState() || {}) as Record<string, unknown>;
  return (state[key] as T) ?? defaultValue;
}

export function setStorageValue<T>(key: string, value: T): void {
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  vscode.setState({ ...state, [key]: value });
}
