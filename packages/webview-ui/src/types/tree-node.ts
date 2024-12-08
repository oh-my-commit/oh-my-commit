import { FileChange } from './file-change';

export interface TreeNode {
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  fileInfo?: FileChange;
  expanded?: boolean;
  displayName: string;
}
