import { GitFileChange } from "@oh-my-commits/shared/common";

export interface CommitState {
  message: string;
  detail: string;
  files: GitFileChange[];
  selectedFiles: string[];
  filesChanged: GitFileChange[];
}

export interface CommitStats {
  added: number;
  modified: number;
  deleted: number;
  total: number;
  additions: number;
  deletions: number;
}
