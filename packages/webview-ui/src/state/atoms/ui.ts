import { atomWithStorage } from "@/lib/storage";
import { ViewMode } from "@/components/commit/file-changes/constants";

// 视图模式
export const viewModeAtom = atomWithStorage<ViewMode>({
  key: "omc.commit.view-mode",
  defaultValue: "flat",
});

// 是否换行
export const diffWrapLineAtom = atomWithStorage<boolean>({
  key: "omc.commit.diff-wrap-line",
  defaultValue: false,
});

export type UiMode = "silent" | "notification" | "window" | "panel";
export const uiModeAtom = atomWithStorage<UiMode>({
  key: "omc.ui.mode",
  defaultValue: "window",
  storageType: "both",
});
