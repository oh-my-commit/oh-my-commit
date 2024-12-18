/**
 * Git 文件变更类型
 */
export enum GitChangeType {
  Added = "added", // A: 新增的文件
  Modified = "modified", // M: 修改的文件
  Deleted = "deleted", // D: 删除的文件
  Renamed = "renamed", // R: 重命名的文件
  Copied = "copied", // C: 复制的文件
  Unmerged = "unmerged", // U: 未合并的文件
  Unknown = "unknown", // ?: 未知状态
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
