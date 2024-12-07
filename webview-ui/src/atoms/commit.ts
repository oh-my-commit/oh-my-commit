import { mockFileChanges } from "@/data/mock-file-changes";
import { atomWithVSCodeStorage } from "./with-vscode-storage";
import { atom } from "jotai";

// 基础 atoms
export const commitDetailAtom = atomWithVSCodeStorage(
  "yaac.commit.detail",
  `我完全重写了 CSS，采用了更简单、更可靠的方案。主要改进：

容器设计：
- 设置固定的初始高度（200px）
- 移除了复杂的 flex 布局
- 简化了 resize 手柄的样式

视图切换：
- 使用简单的 display: none/block 替代复杂的透明度和变换
- 移除了所有动画效果，提高可靠性
- Split 视图时才使用 flex 布局`
);

export const commitMessageAtom = atomWithVSCodeStorage(
  "yaac.commit.message",
  "这是一个测试提交"
);

export const commitFilesAtom = atomWithVSCodeStorage(
  "yaac.commit.files",
  mockFileChanges
);

// 组合 atom
export const commitAtom = atom(
  (get) => ({
    detail: get(commitDetailAtom),
    message: get(commitMessageAtom),
    files: get(commitFilesAtom),
  }),
  (get, set, update: { detail?: string; message?: string; files?: typeof mockFileChanges }) => {
    if (update.detail !== undefined) set(commitDetailAtom, update.detail);
    if (update.message !== undefined) set(commitMessageAtom, update.message);
    if (update.files !== undefined) set(commitFilesAtom, update.files);
  }
);

// 文件统计 atom
export const commitFileStatsAtom = atom((get) => {
  const files = get(commitFilesAtom);
  return {
    added: files.filter(f => f.status === "added").length,
    modified: files.filter(f => f.status === "modified").length,
    deleted: files.filter(f => f.status === "deleted").length,
    total: files.length
  };
});

// 自动生成提交消息 atom
export const autoCommitMessageAtom = atom(
  null,
  (get, set) => {
    const stats = get(commitFileStatsAtom);
    const message = `chore: 更新了 ${stats.total} 个文件`;
    set(commitMessageAtom, message);
  }
);

// 自动生成提交详情 atom
export const autoCommitDetailAtom = atom(
  null,
  (get, set) => {
    const stats = get(commitFileStatsAtom);
    const detail = [
      "变更详情:",
      stats.added > 0 && `- 新增: ${stats.added} 个文件`,
      stats.modified > 0 && `- 修改: ${stats.modified} 个文件`,
      stats.deleted > 0 && `- 删除: ${stats.deleted} 个文件`
    ]
      .filter(Boolean)
      .join("\n");
    
    set(commitDetailAtom, detail);
  }
);

// 重置 atom
export const resetCommitAtom = atom(
  null,
  (get, set) => {
    set(commitDetailAtom, "");
    set(commitMessageAtom, "");
    set(commitFilesAtom, []);
  }
);

// 文件操作 atoms
export const addFileAtom = atom(
  null,
  (get, set, file: typeof mockFileChanges[0]) => {
    const files = get(commitFilesAtom);
    set(commitFilesAtom, [...files, file]);
  }
);

export const removeFileAtom = atom(
  null,
  (get, set, path: string) => {
    const files = get(commitFilesAtom);
    set(commitFilesAtom, files.filter(f => f.path !== path));
  }
);
