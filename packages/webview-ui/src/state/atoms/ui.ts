import { atomWithStorage } from "@/lib/storage";
import { ViewMode, VIEW_MODES } from "@/components/commit/file-changes/constants";

// 视图模式
export const viewModeAtom = atomWithStorage<ViewMode>({
  key: "yaac.commit.view-mode",
  defaultValue: VIEW_MODES.FLAT,
});

// 是否换行
export const diffWrapLineAtom = atomWithStorage<boolean>({
  key: "yaac.commit.diff-wrap-line",
  defaultValue: false,
});

export type UiMode = "silent" | "notification" | "window" | "panel";
export const uiModeAtom = atomWithStorage<UiMode>({
  key: "yaac.ui.mode",
  defaultValue: "window",
  storageType: "both",
});
