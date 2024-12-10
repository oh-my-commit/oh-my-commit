import { atom } from "jotai";

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
    acquireVsCodeApi(): VSCodeAPI;
  }
}

let vscode: VSCodeAPI | undefined;

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

function setToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getVSCodeAPI(): VSCodeAPI {
  if (!vscode) {
    try {
      vscode = window.acquireVsCodeApi();
    } catch (error) {
      // 在非VSCode环境中提供mock实现
      console.warn("Running outside VSCode, using mock implementation");
      const mockState: Record<string, any> = {};
      vscode = {
        getState: () => ({ ...mockState }),
        setState: (state) => Object.assign(mockState, state),
        postMessage: (message) => console.log("VSCode message:", message),
      };
    }
  }
  return vscode;
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
