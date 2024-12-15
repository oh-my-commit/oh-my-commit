// Create atoms for persistent state
import { atomWithStorage } from "@/lib/storage";
import { GitChangeSummary } from "@oh-my-commits/shared/types";

// 文件变更状态
export const changedFilesAtom = atomWithStorage<GitChangeSummary | null>({
  key: "oh-my-commits.commit.changed-files",
  defaultValue: null,
});

// 选中的文件路径列表
export const selectedFilesAtom = atomWithStorage<string[]>({
  defaultValue: [],
  key: "oh-my-commits.commit.changed-files.selected",
});

// 展开的目录列表
export const expandedDirsAtom = atomWithStorage<string[]>({
  defaultValue: [],
  key: "oh-my-commits.commit.changed-files.expanded",
});

// 最后打开的文件路径
export const lastOpenedFilePathAtom = atomWithStorage<string | null>({
  defaultValue: null,
  key: "oh-my-commits.commit.changed-files.last-opened",
});
