export type FileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "default";
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
