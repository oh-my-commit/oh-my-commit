import { atom } from "jotai";
import { WebviewApi } from "vscode-webview";

// VSCode存储选项
export interface VSCodeStorageOptions<T> {
  key: string;
  defaultValue: T;
  // default: 'localStorage'
  storageType?: "vscode" | "localStorage" | "both";
  // vscode workspace/global 配置
  storage?: "global" | "workspace";
}

// VSCode API类型
export interface VSCodeAPI {
  getState: () => Record<string, any>;
  setState: (state: Record<string, any>) => void;
  postMessage: (message: any) => void;
}

declare global {
  interface Window {
    acquireVsCodeApi(): WebviewApi<unknown>;
  }
}

let vscodeApi: WebviewApi<unknown> | undefined;

export function getVSCodeAPI(): WebviewApi<unknown> {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore
  }
}

function getFromVSCode<T>(key: string, defaultValue: T): T {
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  return (state[key] as T) ?? defaultValue;
}

function setToVSCode<T>(key: string, value: T): void {
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  vscode.setState({ ...state, [key]: value });
}

export function atomWithStorage<T>(options: VSCodeStorageOptions<T>) {
  const { key, defaultValue, storageType = "localStorage" } = options;

  // Initialize base atom with appropriate default value
  const initialValue = (() => {
    if (storageType === "localStorage") {
      return getFromLocalStorage(key, defaultValue);
    } else if (storageType === "vscode") {
      return getFromVSCode(key, defaultValue);
    } else {
      // "both"
      // Prefer VSCode state over localStorage
      const vscodeValue = getFromVSCode(key, undefined);
      return vscodeValue ?? getFromLocalStorage(key, defaultValue);
    }
  })();

  const baseAtom = atom<T>(initialValue);

  return atom<T, [T], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      set(baseAtom, update);

      // Sync to appropriate storage(s)
      if (storageType === "localStorage" || storageType === "both") {
        setToLocalStorage(key, update);
      }
      if (storageType === "vscode" || storageType === "both") {
        setToVSCode(key, update);
      }
    },
  );
}

// Read-only atom for derived state
export function atomWithStorageReadOnly<T>(options: VSCodeStorageOptions<T>) {
  const baseAtom = atomWithStorage(options);
  return atom((get) => get(baseAtom));
}

export function createVSCodeAtom<T>({ key, defaultValue }: VSCodeStorageOptions<T>) {
  const baseAtom = atom<T>(defaultValue);

  const derivedAtom = atom(
    (get) => {
      const vscode = getVSCodeAPI();
      const state = vscode.getState() || {};
      return state[key] ?? defaultValue;
    },
    (get, set, update: T) => {
      const vscode = getVSCodeAPI();
      const state = vscode.getState() || {};
      vscode.setState({
        ...state,
        [key]: update,
      });
      set(baseAtom, update);
    }
  );

  return derivedAtom;
}
