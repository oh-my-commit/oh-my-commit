import type { DiffResult } from "simple-git"
import type { BaseGenerateCommitProvider, Model } from "../common/types/provider.js"

export class CommitManager {
  private providers: BaseGenerateCommitProvider[]

  constructor() {
    this.providers = []
  }

  public registerProviders() {
    // todo: traverse all the packages whose name starts with `@provider-`
    // then push into `this.providers`
  }

  public async getAvailableModels(): Promise<Model[]> {
    return this.providers.flatMap(p => p.models)
  }

  public async generateCommit(diff: DiffResult, modelId: string) {
    const models = await this.getAvailableModels()
    const model = models.find(m => m.id === modelId)
    if (!model) throw new Error(`Model with id ${modelId} not found`)

    const provider = this.providers.find(p => p.models.some(model => model.id === modelId))
    if (!provider) throw new Error(`Provider with id ${modelId} not found`)

    return provider.generateCommit({
      diff: diff,
      model,
      options: {
        lang: "zh-CN",
      },
    })
  }
}
