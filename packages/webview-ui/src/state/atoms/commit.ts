import { atom } from "jotai";
import { CommitState, CommitStats } from "../types";
import { FileChange } from "@/types/file-change";
import { atomWithStorage } from "../storage";

// 基础状态原子
export const commitMessageAtom = atomWithStorage({
  key: "yaac.commit.message",
  defaultValue: "",
  storageType: "localStorage",
});

export const commitDetailAtom = atomWithStorage({
  key: "yaac.commit.detail",
  defaultValue: "",
  storageType: "localStorage",
});

export const commitFilesAtom = atomWithStorage<FileChange[]>({
  key: "yaac.commit.files",
  defaultValue: [],
  storageType: "localStorage",
});

export const selectedFilesAtom = atomWithStorage<string[]>({
  key: "yaac.commit.selectedFiles",
  defaultValue: [],
  storageType: "localStorage",
});

// 派生状态
export const commitStatsAtom = atom<CommitStats>((get) => {
  const files = get(commitFilesAtom);
  const selectedFiles = get(selectedFilesAtom);

  const added = files.filter((f) => f.type === "added").length;
  const modified = files.filter((f) => f.type === "modified").length;
  const deleted = files.filter((f) => f.type === "deleted").length;

  return {
    added,
    modified,
    deleted,
    total: files.length,
    additions: files.reduce((sum, file) => sum + file.additions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0),
  };
});

// 组合状态
export const commitStateAtom = atom<CommitState, [Partial<CommitState>], void>(
  (get) => ({
    message: get(commitMessageAtom),
    detail: get(commitDetailAtom),
    files: get(commitFilesAtom),
    selectedFiles: get(selectedFilesAtom),
  }),
  (_get, set, update) => {
    if (update.message !== undefined) set(commitMessageAtom, update.message);
    if (update.detail !== undefined) set(commitDetailAtom, update.detail);
    if (update.files !== undefined) set(commitFilesAtom, update.files);
    if (update.selectedFiles !== undefined)
      set(selectedFilesAtom, update.selectedFiles);
  }
);
