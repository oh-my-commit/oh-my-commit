export interface TreeNode {
    path: string;
    type: "file" | "directory";
    children?: TreeNode[];
    fileInfo?: {
        path: string;
        status: string;
        additions: number;
        deletions: number;
        diff: string;
    };
}