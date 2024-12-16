import { atom } from "jotai";
let vscode;
function getFromLocalStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        if (!item)
            return defaultValue;
        const parsed = JSON.parse(item);
        return parsed === undefined ? defaultValue : parsed;
    }
    catch (error) {
        console.warn(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
}
function setToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.warn(`Error writing to localStorage for key "${key}":`, error);
    }
}
export function getVSCodeAPI() {
    if (!vscode) {
        try {
            vscode = window.acquireVsCodeApi();
        }
        catch (error) {
            // 在非VSCode环境中提供mock实现
            console.warn("Running outside VSCode, using mock implementation");
            const mockState = {};
            vscode = {
                getState: () => ({ ...mockState }),
                setState: (state) => Object.assign(mockState, state),
                postMessage: (message) => console.log("VSCode message:", message),
            };
        }
    }
    return vscode;
}
function getFromVSCode(key, defaultValue) {
    const vscode = getVSCodeAPI();
    const state = vscode.getState() || {};
    return state[key] ?? defaultValue;
}
function setToVSCode(key, value) {
    const vscode = getVSCodeAPI();
    const state = vscode.getState() || {};
    vscode.setState({ ...state, [key]: value });
}
export function atomWithStorage(options) {
    const { key, defaultValue, storageType = "localStorage" } = options;
    // Initialize base atom with appropriate default value
    const initialValue = (() => {
        if (storageType === "localStorage") {
            return getFromLocalStorage(key, defaultValue);
        }
        else if (storageType === "vscode") {
            return getFromVSCode(key, defaultValue);
        }
        else {
            // "both"
            // Prefer VSCode state over localStorage
            const vscodeValue = getFromVSCode(key, undefined);
            return vscodeValue ?? getFromLocalStorage(key, defaultValue);
        }
    })();
    const baseAtom = atom(initialValue);
    return atom((get) => get(baseAtom), (get, set, update) => {
        set(baseAtom, update);
        // Sync to appropriate storage(s)
        if (storageType === "localStorage" || storageType === "both") {
            setToLocalStorage(key, update);
        }
        if (storageType === "vscode" || storageType === "both") {
            setToVSCode(key, update);
        }
    });
}
// Read-only atom for derived state
export function atomWithStorageReadOnly(options) {
    const baseAtom = atomWithStorage(options);
    return atom((get) => get(baseAtom));
}
//# sourceMappingURL=storage.js.map