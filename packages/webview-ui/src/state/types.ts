// 核心业务类型
import { FileStatus } from "@/types/file-change";

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
export interface CommitStats {
  added: number;
  modified: number;
  deleted: number;
  total: number;
  additions: number;
  deletions: number;
}

// VSCode存储选项
export interface VSCodeStorageOptions<T> {
  key: string;
  defaultValue: T;
  // default: 'localStorage'
  storageType?: "vscode" | "localStorage" | "both";
  // vscode workspace/global 配置
  storage?: "global" | "workspace";
}

// VSCode API类型
export interface VSCodeAPI {
  getState: () => Record<string, any>;
  setState: (state: Record<string, any>) => void;
  postMessage: (message: any) => void;
}
