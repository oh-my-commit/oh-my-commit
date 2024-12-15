import { Result } from "neverthrow";
import { Model } from "./model";
import { CommitData } from "./commit";
import { GitChangeSummary } from "./git";
import { BaseLogger } from "@/utils/BaseLogger";
import { ConsoleLogger } from "@/utils/ConsoleLogger";

export abstract class Provider {
  public logger: BaseLogger = new ConsoleLogger("Oh My Commits");
  protected config: any;
  protected enabled: boolean = true;

  abstract id: string;
  abstract displayName: string;
  abstract description: string;
  abstract models: Model[];

  abstract generateCommit(
    diff: GitChangeSummary,
    model: Model,
    options?: { lang?: string }
  ): Promise<Result<CommitData, string>>;
}
