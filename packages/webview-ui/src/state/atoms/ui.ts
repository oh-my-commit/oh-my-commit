import { atomWithStorage } from "@/lib/storage";
import { ViewMode } from "@/components/commit/file-changes/constants";

// 视图模式
export const viewModeAtom = atomWithStorage<ViewMode>({
  key: "oh-my-commit.commit.view-mode",
  defaultValue: "flat",
});

// 是否换行
export const diffWrapLineAtom = atomWithStorage<boolean>({
  key: "oh-my-commit.commit.diff-wrap-line",
  defaultValue: false,
});

export type UiMode = "silent" | "notification" | "window" | "panel";
export const uiModeAtom = atomWithStorage<UiMode>({
  key: "oh-my-commit.ui.mode",
  defaultValue: "window",
  storageType: "both",
});
