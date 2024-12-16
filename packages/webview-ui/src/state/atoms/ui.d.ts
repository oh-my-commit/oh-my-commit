import { ViewMode } from "@/components/commit/file-changes/constants";
export declare const viewModeAtom: import("jotai").WritableAtom<ViewMode, [ViewMode], void>;
export declare const diffWrapLineAtom: import("jotai").WritableAtom<boolean, [boolean], void>;
export type UiMode = "silent" | "notification" | "window" | "panel";
export declare const uiModeAtom: import("jotai").WritableAtom<UiMode, [UiMode], void>;
