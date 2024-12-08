import { atom } from "jotai";
import { atomWithVSCodeStorage } from "../storage/vscode-storage";
import { FileSelectionState } from "../types";
import { commitFilesAtom, selectedFilesAtom } from "./commit-core";
import type { FileChange } from "../../types/file-change";

// 文件选择状态
export const fileSelectionAtom = atomWithVSCodeStorage<FileSelectionState>({
  key: "yaac.selection.files",
  defaultValue: { selectedPaths: new Set<string>() },
});

// 选择动作
export const toggleFileSelectionAtom = atom<null, [string[]], void>(
  null,
  (get, set, paths) => {
    const { selectedPaths } = get(fileSelectionAtom);
    const changes = get(commitFilesAtom);
    const newSelectedPaths = new Set(selectedPaths);

    paths.forEach((path) => {
      const fileExists = changes.some((f: FileChange) => f.path === path);
      if (!fileExists) return;

      if (newSelectedPaths.has(path)) {
        newSelectedPaths.delete(path);
      } else {
        newSelectedPaths.add(path);
      }
    });

    set(fileSelectionAtom, { selectedPaths: newSelectedPaths });
  }
);

// 重置选择状态
export const resetSelectionAtom = atom<null, [], void>(null, (_get, set) => {
  set(fileSelectionAtom, { selectedPaths: new Set<string>() });
});

// 自动生成提交信息（基于选中文件）
export const generateCommitMessageAtom = atom((get) => {
  const { selectedPaths } = get(fileSelectionAtom);
  const changes = get(commitFilesAtom);
  const selectedChanges = changes.filter((f: FileChange) =>
    selectedPaths.has(f.path)
  );

  const stats = {
    added: selectedChanges.filter((f: FileChange) => f.status === "added")
      .length,
    modified: selectedChanges.filter((f: FileChange) => f.status === "modified")
      .length,
    deleted: selectedChanges.filter((f: FileChange) => f.status === "deleted")
      .length,
    total: selectedChanges.length,
  };

  // 生成提交信息
  const message = `chore: 更新了 ${stats.total} 个文件`;
  const detail = [
    "变更详情:",
    stats.added > 0 && `- 新增: ${stats.added} 个文件`,
    stats.modified > 0 && `- 修改: ${stats.modified} 个文件`,
    stats.deleted > 0 && `- 删除: ${stats.deleted} 个文件`,
  ]
    .filter(Boolean)
    .join("\n");

  return { message, detail };
});
