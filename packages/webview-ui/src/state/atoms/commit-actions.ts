import { atom } from "jotai";
import {
  commitFilesAtom,
  selectedFilesAtom,
  commitMessageAtom,
  commitDetailAtom,
} from "./commit";
import { FileChange } from "../types";

// 添加文件动作
export const addFileAtom = atom(null, (get, set, file: FileChange) => {
  const files = get(commitFilesAtom);
  const exists = files.some((f) => f.path === file.path);
  if (!exists) {
    set(commitFilesAtom, [...files, file]);
  }
});

// 移除文件动作
export const removeFileAtom = atom(null, (get, set, path: string) => {
  const files = get(commitFilesAtom);
  const selectedFiles = get(selectedFilesAtom);

  set(
    commitFilesAtom,
    files.filter((f) => f.path !== path)
  );
  set(
    selectedFilesAtom,
    selectedFiles.filter((p) => p !== path)
  );
});

// 切换文件选择状态
export const toggleFileSelectionAtom = atom(
  null,
  (get, set, paths: string[]) => {
    const selectedFiles = new Set(get(selectedFilesAtom));
    const files = get(commitFilesAtom);

    paths.forEach((path) => {
      const fileExists = files.some((f) => f.path === path);
      if (!fileExists) return;

      if (selectedFiles.has(path)) {
        selectedFiles.delete(path);
      } else {
        selectedFiles.add(path);
      }
    });

    set(selectedFilesAtom, Array.from(selectedFiles));
  }
);

// 重置提交状态
export const resetCommitAtom = atom(null, (get, set) => {
  set(commitMessageAtom, "");
  set(commitDetailAtom, "");
  set(commitFilesAtom, []);
  set(selectedFilesAtom, []);
});
