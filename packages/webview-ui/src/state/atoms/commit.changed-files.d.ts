import type { DiffResult } from "simple-git";
export declare const diffResultAtom: import("jotai").WritableAtom<DiffResult | null, [DiffResult | null], void>;
export declare const selectedFilesAtom: import("jotai").WritableAtom<string[], [string[]], void>;
export declare const expandedDirsAtom: import("jotai").WritableAtom<string[], [string[]], void>;
export declare const lastOpenedFilePathAtom: import("jotai").WritableAtom<string | null, [string | null], void>;
