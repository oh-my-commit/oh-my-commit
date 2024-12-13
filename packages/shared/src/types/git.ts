/**
 * Git 文件状态
 */
export type FileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "default";

/**
 * Git 文件变更信息
 */
export interface FileChange {
  /** 文件路径 */
  path: string;
  /** 文件变更类型 */
  type: FileStatus;
  /** 文件状态 */
  status: FileStatus;
  /** 当前内容 */
  content?: string;
  /** 原始内容 */
  oldContent?: string;
  /** 新增行数 */
  additions: number;
  /** 删除行数 */
  deletions: number;
  /** 显示名称 */
  displayName?: string;
  /** diff 内容 */
  diff?: string;
  /** 是否已暂存 */
  isStaged?: boolean;
}
