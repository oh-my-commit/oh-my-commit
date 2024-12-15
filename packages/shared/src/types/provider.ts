import { Result } from "neverthrow";
import { Model } from "./model";
import { CommitData } from "./commit";
import { GitChangeSummary } from "./git";
import { BaseLogger } from "../providers/BaseLogger";

export abstract class Provider {
  protected config: any;
  public abstract logger: BaseLogger;

  static id: string;
  static displayName: string;
  static description: string;
  static enabled: boolean;
  static models: Model[];

  abstract generateCommit(
    diff: GitChangeSummary,
    model: Model,
    options?: { lang?: string }
  ): Promise<Result<CommitData, string>>;
}
