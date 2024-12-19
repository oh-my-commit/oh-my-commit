import { BaseGenerateCommitProvider, Model } from "@/common/types/provider";
import { DiffResult } from "simple-git";

export class CommitManager {
  private providers: BaseGenerateCommitProvider[];

  constructor() {
    this.providers = [];
  }

  public registerProviders() {
    // todo: traverse all the packages whose name starts with `@oh-my-commit/provider-`
    // then push into `this.providers`
  }

  public async getAvailableModels(): Promise<Model[]> {
    return this.providers.flatMap((p) => p.models);
  }

  public async generateCommit(diff: DiffResult, modelId: string) {
    const models = await this.getAvailableModels();
    const model = models.find((m) => m.id === modelId);
    if (!model) throw new Error(`Model with id ${modelId} not found`);

    const provider = this.providers.find((p) =>
      p.models.some((model) => model.id === modelId),
    );
    if (!provider) throw new Error(`Provider with id ${modelId} not found`);

    return provider.generateCommit({
      diff: diff,
      model,
      options: {
        lang: "zh-CN",
      },
    });
  }
}
