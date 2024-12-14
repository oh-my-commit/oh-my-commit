import { DiffResult } from "simple-git";

/**
 * Git 文件状态 // todo: 以后再做这么细
 */
export type GitFileStatus =
  | "untracked" // 未跟踪的新文件
  | "modified" // 已修改
  | "deleted" // 已删除
  | "renamed" // 已重命名
  | "copied" // 已复制
  | "unmerged"; // 未合并

/**
 * Git 文件变更类型 (AMD)
 */
export type GitChangeType =
  | "added" // A: 新增的文件
  | "modified" // M: 修改的文件
  | "deleted"; // D: 删除的文件

/**
 * Git 文件变更信息
 */
export interface GitFileChange {
  /** 显示名称 */
  displayName?: string;
  /** 文件路径 */
  path: string;
  /** 文件原始路径(重命名时使用) */
  oldPath?: string;
  /** 文件状态 */
  status: GitChangeType;
  /** diff 内容 */
  diff?: string;
  /** 新增行数 */
  additions: number;
  /** 删除行数 */
  deletions: number;

  /** 变更类型(AMD) */
  // type: GitChangeType;
  /** 当前内容 */
  content?: string;
  /** 原始内容 */
  oldContent?: string;

  /** 是否已暂存 */
  // staged: boolean;
}

/**
 * Git 仓库变更摘要
 */
export interface GitChangeSummary extends DiffResult {}
