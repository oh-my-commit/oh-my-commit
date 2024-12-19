"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomWithStorage = atomWithStorage;
exports.atomWithStorageReadOnly = atomWithStorageReadOnly;
exports.createVSCodeAtom = createVSCodeAtom;
const jotai_1 = require("jotai");
const getVSCodeAPI_1 = require("./getVSCodeAPI");
function getFromLocalStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    }
    catch {
        return defaultValue;
    }
}
function setToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch {
        // Ignore
    }
}
function getFromVSCode(key, defaultValue) {
    const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
    const state = (vscode.getState() || {});
    return state[key] ?? defaultValue;
}
function setToVSCode(key, value) {
    const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
    const state = (vscode.getState() || {});
    vscode.setState({ ...state, [key]: value });
}
function atomWithStorage(options) {
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
    const baseAtom = (0, jotai_1.atom)(initialValue);
    return (0, jotai_1.atom)(get => get(baseAtom), (get, set, update) => {
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
function atomWithStorageReadOnly(options) {
    const baseAtom = atomWithStorage(options);
    return (0, jotai_1.atom)(get => get(baseAtom));
}
function createVSCodeAtom({ key, defaultValue }) {
    const baseAtom = (0, jotai_1.atom)(defaultValue);
    const derivedAtom = (0, jotai_1.atom)(get => {
        const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
        const state = (vscode.getState() || {});
        return state[key] ?? defaultValue;
    }, (get, set, update) => {
        const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
        const state = (vscode.getState() || {});
        vscode.setState({
            ...state,
            [key]: update,
        });
        set(baseAtom, update);
    });
    return derivedAtom;
}
