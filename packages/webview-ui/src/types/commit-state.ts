import { FileChange } from './file-change';

export interface CommitState {
  message: string;
  detail: string;
  files: FileChange[];
  selectedFiles: string[];
  filesChanged: FileChange[];
}

export interface CommitStats {
  added: number;
  modified: number;
  deleted: number;
  total: number;
  additions: number;
  deletions: number;
}
