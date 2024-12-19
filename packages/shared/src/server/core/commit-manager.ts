import { formatError } from "@/common/format-error";
import { BaseGenerateCommitProvider, Model } from "@/common/types/provider";
import { BaseLogger } from "@/common/utils/logger";
import { OmcProvider } from "@/server/providers/oh-my-commit";
import { err } from "neverthrow";
import { DiffResult } from "simple-git";

export interface CommitManagerOptions {
  logger?: BaseLogger;
}

export class CommitManager {
  private provider: BaseGenerateCommitProvider;

  constructor(options: CommitManagerOptions = {}) {
    this.provider = new OmcProvider(options.logger);
  }

  public async getAvailableModels(): Promise<Model[]> {
    return this.provider.models;
  }

  public async generateCommit(diff: DiffResult, modelId: string) {
    const models = await this.getAvailableModels();
    const model = models.find((m) => m.id === modelId);
    if (!model) throw new Error(`Model with id ${modelId} not found`);

    return await this.provider.generateCommit({
      diff: diff,
      model,
      options: {
        lang: "zh-CN",
      },
    });
  }
}
