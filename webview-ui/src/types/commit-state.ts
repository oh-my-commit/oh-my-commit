export interface CommitState {
    title: string;
    body: string;
    isAmendMode: boolean;
    diff: string;
    filesChanged: Array<{
        path: string;
        status: string;
        additions: number;
        deletions: number;
        diff: string;
    }>;
    selectedFiles: Set<string>;
}