export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  status: 'added' | 'modified' | 'deleted';
  content?: string;
  oldContent?: string;
  additions: number;
  deletions: number;
  displayName?: string;
  diff?: string;
}
