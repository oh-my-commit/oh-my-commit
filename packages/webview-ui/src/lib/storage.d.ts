export interface VSCodeStorageOptions<T> {
    key: string;
    defaultValue: T;
    storageType?: "vscode" | "localStorage" | "both";
    storage?: "global" | "workspace";
}
export declare function atomWithStorage<T>(options: VSCodeStorageOptions<T>): import("jotai").WritableAtom<T, [T], void>;
export declare function atomWithStorageReadOnly<T>(options: VSCodeStorageOptions<T>): import("jotai").Atom<T>;
export declare function createVSCodeAtom<T>({ key, defaultValue }: VSCodeStorageOptions<T>): import("jotai").WritableAtom<{} | T, [update: T], void>;
