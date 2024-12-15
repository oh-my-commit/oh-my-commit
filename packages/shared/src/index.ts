// Core exports
export { CommitManager } from "./core/commit-manager";

// Type exports
export type { Model } from "./types/model";
export type { Provider } from "./types/provider";
export type { GitChangeSummary, GitFileChange } from "./types/git";
export { GitChangeType } from "./types/git";
export type { CommitData } from "./types/commit";
export type { TreeNode } from "./types/tree";

// Provider exports
export { OhMyCommitProvider } from "./providers/oh-my-commit";

// Result type re-export from neverthrow
export { Result, ok, err } from "neverthrow";
