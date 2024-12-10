// Create atoms for persistent state
import { atomWithStorage } from "@/lib/storage";
import type { CommitStats } from "@/state/types";
import { FileChange } from "@/types/file-change";
import { atom } from "jotai/index";

export const stagedFilesAtom = atomWithStorage<FileChange[]>({
  key: "yaac.commit.staged-files",
  defaultValue: [],
  storageType: "localStorage",
});

export const unstagedFilesAtom = atomWithStorage<FileChange[]>({
  key: "yaac.commit.unstaged-files",
  defaultValue: [],
  storageType: "localStorage",
});

export const expandedDirsAtom = atomWithStorage<string[]>({
  key: "yaac.webview-ui.treeview.expanded-dirs",
  defaultValue: [],
  storageType: "both",
});

export const selectedFilesAtom = atomWithStorage<string[]>({
  key: "yaac.webview-ui.treeview.selected-files",
  defaultValue: [],
  storageType: "both",
}); // 是否显示diff预览（与lastOpenedFile关联）
// 持久化的最后打开的文件
export const lastOpenedFilePathAtom = atomWithStorage<string>({
  key: "yaac.webview-ui.treeview.last-opened-file",
  defaultValue: "",
  storageType: "both",
});

// 派生状态
export const commitStatsAtom = atom<CommitStats>((get) => {
  const stagedFiles = get(stagedFilesAtom);
  const unstagedFiles = get(unstagedFilesAtom);
  const selectedPaths = new Set(get(selectedFilesAtom));

  const getStats = (files: FileChange[]) => ({
    added: files.filter((f) => f.type === "added").length,
    modified: files.filter((f) => f.type === "modified").length,
    deleted: files.filter((f) => f.type === "deleted").length,
    additions: files.reduce((sum, f) => sum + (f.additions || 0), 0),
    deletions: files.reduce((sum, f) => sum + (f.deletions || 0), 0),
  });

  const stagedStats = getStats(stagedFiles);
  const unstagedStats = getStats(unstagedFiles);
  const selectedStats = getStats(
    [...stagedFiles, ...unstagedFiles].filter((f) => selectedPaths.has(f.path))
  );

  return {
    staged: stagedStats,
    unstaged: unstagedStats,
    selected: selectedStats,
    total: {
      files: stagedFiles.length + unstagedFiles.length,
      selectedFiles: selectedPaths.size,
      ...getStats([...stagedFiles, ...unstagedFiles]),
    },
  };
});
