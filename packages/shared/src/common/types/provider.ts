import { APP_NAME } from "@/common/constants";
import { BaseLogger, ConsoleLogger } from "@/common/utils/logger";
import { Result } from "neverthrow";
import { Model } from "@/common/types/model";
import { CommitData } from "@/common/types/commit";
import { GitChangeSummary } from "@/common/types/git";
export abstract class Provider {
  public logger: BaseLogger = new ConsoleLogger(APP_NAME);
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
