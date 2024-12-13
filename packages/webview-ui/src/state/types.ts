// 核心业务类型

import { FileStatus } from "@yaac/shared";

export interface FileChange {
  path: string;
  type: FileStatus;
  status: FileStatus;
  content?: string;
  oldContent?: string;
  additions: number;
  deletions: number;
  displayName?: string;
  diff?: string;
}

// 核心提交状态
export interface CommitState {
  message: string;
  detail: string;
  files: FileChange[];
  selectedFiles: string[];
}

// UI 展示状态
export interface FileUIState {
  path: string;
  isExpanded: boolean;
}

// 文件选择状态（用于生成 commit message）
export interface FileSelectionState {
  selectedPaths: Set<string>;
}

// 统计信息（派生状态）
export interface FileStats {
  added: number;
  modified: number;
  deleted: number;
  additions: number;
  deletions: number;
}

export interface CommitStats {
  staged: FileStats;
  unstaged: FileStats;
  selected: FileStats;
  total: {
    files: number;
    selectedFiles: number;
  } & FileStats;
}