import { Result } from "neverthrow";
import { GitChangeSummary } from "./git";

export type CommitData = {
  title: string;
  body?: string;
};
export type GenerateCommitResult = Result<CommitData, Error>;

export type CommitEvent = {
  type: "commit";
  message: CommitData;
  diffSummary: GitChangeSummary;
};
