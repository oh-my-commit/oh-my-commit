import { atom } from "jotai";
import type { FileChange } from "../../types/file-change";
import type { CommitState, CommitStats } from "../types";

// 核心状态原子
export const commitMessageAtom = atom<string>("");
export const commitDetailAtom = atom<string>("");
export const commitFilesAtom = atom<FileChange[]>([]);
export const selectedFilesAtom = atom<string[]>([]);

// 派生状态
export const commitStatsAtom = atom<CommitStats>((get) => {
  const files = get(commitFilesAtom);
  const selectedPaths = new Set(get(selectedFilesAtom));

  const totalFiles = files.length;
  const selectedFiles = files.filter((f) => selectedPaths.has(f.path)).length;

  return {
    added: files.filter((f) => f.type === "added").length,
    modified: files.filter((f) => f.type === "modified").length,
    deleted: files.filter((f) => f.type === "deleted").length,
    total: totalFiles,
    additions: files.reduce((sum, f) => sum + (f.additions || 0), 0),
    deletions: files.reduce((sum, f) => sum + (f.deletions || 0), 0),
  };
});

// 完整提交状态
export const commitStateAtom = atom<CommitState>((get) => ({
  message: get(commitMessageAtom),
  detail: get(commitDetailAtom),
  files: get(commitFilesAtom),
  selectedFiles: get(selectedFilesAtom),
  filesChanged: get(commitFilesAtom),
}));

// 更新提交状态的action
export const updateCommitStateAtom = atom(
  null,
  (get, set, update: Partial<CommitState>) => {
    if (update.message !== undefined) set(commitMessageAtom, update.message);
    if (update.detail !== undefined) set(commitDetailAtom, update.detail);
    if (update.files !== undefined) set(commitFilesAtom, update.files);
    if (update.selectedFiles !== undefined) set(selectedFilesAtom, update.selectedFiles);
  }
);

// 重置提交状态
export const resetCommitStateAtom = atom(null, (get, set) => {
  set(commitMessageAtom, "");
  set(commitDetailAtom, "");
  set(commitFilesAtom, []);
  set(selectedFilesAtom, []);
});
