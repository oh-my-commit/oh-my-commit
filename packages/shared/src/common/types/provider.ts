import { APP_NAME } from "@/common/constants";
import { CommitData } from "@/common/types/commit";
import { Model } from "@/common/types/model";
import { BaseLogger, ConsoleLogger } from "@/common/utils/logger";
import { Result, ResultAsync } from "neverthrow";
import { DiffResult } from "simple-git";

export abstract class Provider {
  public logger: BaseLogger = new ConsoleLogger(APP_NAME);
  abstract id: string;
  abstract displayName: string;
  abstract description: string;
  abstract models: Model[];
  protected config: any;
  protected enabled: boolean = true;

  abstract generateCommit(
    diff: DiffResult,
    model: Model,
    options?: {
      lang?: string;
    },
  ): ResultAsync<CommitData, Error>;
}
