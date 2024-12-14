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
export enum GitChangeType {
  Added = "added", // A: 新增的文件
  Modified = "modified", // M: 修改的文件
  Deleted = "deleted", // D: 删除的文件
}

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
  /** 文件差异 */
  diff?: string;
  /** 增加的行数 */
  additions: number;
  /** 删除的行数 */
  deletions: number;
  /** 文件内容 */
  content?: string;
  /** 文件原始内容 */
  oldContent?: string;
}

/**
 * Git 仓库变更摘要
 */
export interface GitChangeSummary {
  changed: number;
  files: GitFileChange[];
  insertions: number;
  deletions: number;
}
