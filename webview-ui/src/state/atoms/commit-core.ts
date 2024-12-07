import { atom } from "jotai";
import type { FileChange, CommitState, CommitStats } from "../types";

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

  const stats = {
    added: files.filter((f: FileChange) => f.status === "added").length,
    modified: files.filter((f: FileChange) => f.status === "modified").length,
    deleted: files.filter((f: FileChange) => f.status === "deleted").length,
    total: totalFiles,
    additions: files.reduce((sum, f) => sum + f.additions, 0),
    deletions: files.reduce((sum, f) => sum + f.deletions, 0),
  };

  return stats;
});

// 完整提交状态
export const commitStateAtom = atom<CommitState>((get) => ({
  message: get(commitMessageAtom),
  detail: get(commitDetailAtom),
  changes: get(commitFilesAtom),
}));

// 更新提交状态的action
export const updateCommitStateAtom = atom(
  null,
  (get, set, update: Partial<CommitState>) => {
    if (update.message !== undefined) set(commitMessageAtom, update.message);
    if (update.detail !== undefined) set(commitDetailAtom, update.detail);
    if (update.changes !== undefined) set(commitFilesAtom, update.changes);
  }
);

// 文件操作actions
export const addFileAtom = atom(null, (get, set, file: FileChange) => {
  const files = get(commitFilesAtom);
  const fileExists = files.some((f) => f.path === file.path);
  if (!fileExists) {
    set(commitFilesAtom, [...files, file]);
  }
});

export const removeFileAtom = atom(null, (get, set, path: string) => {
  const files = get(commitFilesAtom);
  set(
    commitFilesAtom,
    files.filter((f: FileChange) => f.path !== path)
  );
});

export const resetFilesAtom = atom(null, (get, set) => {
  set(commitFilesAtom, []);
  set(selectedFilesAtom, []);
});
