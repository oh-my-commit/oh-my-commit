import { CommitData } from "../types/commit";
import { GitChangeSummary } from "../types/git";
import { Result, err } from "neverthrow";
import { Model } from "../types/model";
import { Provider } from "../types/provider";
import { OmcProvider } from "../providers/oh-my-commits";
import { BaseLogger } from "@/utils/BaseLogger";

export interface CommitManagerOptions {
  logger?: BaseLogger;
}

export class CommitManager {
  private provider: Provider;

  constructor(options: CommitManagerOptions = {}) {
    this.provider = new OmcProvider(options.logger);
  }

  public async getAvailableModels(): Promise<Model[]> {
    return this.provider.models;
  }

  public async generateCommit(
    changeSummary: GitChangeSummary,
    modelId: string = "oh-my-commits/standard"
  ): Promise<Result<CommitData, string>> {
    const models = await this.getAvailableModels();
    const model = models.find((m) => m.id === modelId);

    if (!model) {
      return err(
        `Model ${modelId} not found. Available models: ${models
          .map((m) => m.id)
          .join(", ")}`
      );
    }

    try {
      return await this.provider.generateCommit(changeSummary, model, {
        lang: "zh-CN",
      });
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
}
