import { Result } from "neverthrow";

export type CommitData = {
  title: string;
  body?: string;
};
export type GenerateCommitResult = Result<CommitData, string>;