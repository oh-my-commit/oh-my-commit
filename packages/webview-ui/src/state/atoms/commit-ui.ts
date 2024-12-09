import { atom } from "jotai";
import type { FileUIState } from "../types";
import { VIEW_MODES } from "../../components/commit/file-changes/constants";
import { atomWithStorage } from "../storage";

// 持久化的最后打开的文件
export const lastOpenedFilePathAtom = atomWithStorage<string>({
  key: "yaac.webview-ui.treeview.last-opened-file",
  defaultValue: "",
  storageType: "both",
});

// 文件UI状态（展开/折叠等）
export const fileUIStatesAtom = atom<Record<string, FileUIState>>({});

// 是否显示diff预览（与lastOpenedFile关联）
export const showDiffAtom = atom(
  (get) => !!get(lastOpenedFilePathAtom),
  (get, set, showDiff: boolean) => {
    if (!showDiff) {
      set(lastOpenedFilePathAtom, "");
    }
  }
);

// 搜索查询
export const searchQueryAtom = atom<string>("");

// UI操作
export const toggleFileExpansionAtom = atom(null, (get, set, path: string) => {
  const states = get(fileUIStatesAtom);
  const currentState = states[path] || { path, isExpanded: false };
  set(fileUIStatesAtom, {
    ...states,
    [path]: { ...currentState, isExpanded: !currentState.isExpanded },
  });
});

// View mode atom with persistence
export const viewModeAtom = atomWithStorage<keyof typeof VIEW_MODES>({
  key: "yaac.webview.viewMode",
  defaultValue: "flat",
  storageType: "both",
});
