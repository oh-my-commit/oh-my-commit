export interface VSCodeStorageOptions<T> {
    key: string;
    defaultValue: T;
    storageType?: "vscode" | "localStorage" | "both";
    storage?: "global" | "workspace";
}
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
export declare function getVSCodeAPI(): VSCodeAPI;
export declare function atomWithStorage<T>(options: VSCodeStorageOptions<T>): import("jotai").WritableAtom<T, [T], void>;
export declare function atomWithStorageReadOnly<T>(options: VSCodeStorageOptions<T>): import("jotai").Atom<T>;
