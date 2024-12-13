import { FileChange } from './git';

export interface TreeNode {
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  fileInfo?: FileChange;
  expanded?: boolean;
  displayName: string;
}
