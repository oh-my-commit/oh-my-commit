import { Result } from "neverthrow";
import { Model } from "./model";
import { CommitData } from "./commit";
import { GitChangeSummary } from "./git";

export interface Provider {
  generateCommit(
    diff: GitChangeSummary,
    model: Model,
    options?: { lang?: string }
  ): Promise<Result<CommitData, string>>;
  config: any;
  logger: any;
}
