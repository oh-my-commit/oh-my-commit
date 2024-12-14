import { Result } from "neverthrow";
import { DiffSummary } from "simple-git/dist/src/lib/responses/DiffSummary";

export type CommitData = {
  title: string;
  body?: string;
};
export type GenerateCommitResult = Result<CommitData, string>;

export type CommitEvent = {
  type: "commit";
  message: GenerateCommitResult;
  diffSummary: DiffSummary;
};
