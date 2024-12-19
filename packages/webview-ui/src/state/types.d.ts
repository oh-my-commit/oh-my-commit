import type { GitChangeType } from "@shared/common";
export interface FileChange {
    path: string;
    type: GitChangeType;
    status: GitChangeType;
    content?: string;
    oldContent?: string;
    additions: number;
    deletions: number;
    displayName?: string;
    diff?: string;
    isStaged?: boolean;
}
export interface CommitState {
    message: string;
    detail: string;
    files: FileChange[];
    selectedFiles: string[];
}
export interface FileUIState {
    path: string;
    isExpanded: boolean;
}
export interface FileSelectionState {
    selectedPaths: Set<string>;
}
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
