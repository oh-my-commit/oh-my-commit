export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
  size?: number;
  displayName?: string;
  fileInfo?: {
    path: string;
    size: number;
    type: string;
    modified: string;
    additions?: number;
    deletions?: number;
    status?: string;
  };
  stats?: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
  };
}
