import { atomWithStorage } from "jotai/utils";

export type ViewMode = "plain" | "split" | "preview";

// 编辑器视图模式
export const descriptionViewModeAtom = atomWithStorage<ViewMode>(
  "commit_description_view_mode",
  "split"
);

// 后续可以添加更多用户偏好设置
// export const otherPreferenceAtom = atomWithStorage("key", defaultValue);
