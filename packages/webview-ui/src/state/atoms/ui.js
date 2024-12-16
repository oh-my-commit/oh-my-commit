import { atomWithStorage } from "@/lib/storage";
// 视图模式
export const viewModeAtom = atomWithStorage({
    key: "oh-my-commits.commit.view-mode",
    defaultValue: "flat",
});
// 是否换行
export const diffWrapLineAtom = atomWithStorage({
    key: "oh-my-commits.commit.diff-wrap-line",
    defaultValue: false,
});
export const uiModeAtom = atomWithStorage({
    key: "oh-my-commits.ui.mode",
    defaultValue: "window",
    storageType: "both",
});
//# sourceMappingURL=ui.js.map