import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import { SETTING_MODEL_ID } from "./app"
import { TOKENS, type IConfig, type IProviderManager } from "./core"
import { BaseLogger } from "./log"
import type { GenerateCommitOptions, IModel, Status } from "./provider.interface"

@Service()
export class CommitManager {
  public status: {
    loadingProviders: Status
  } = {
    loadingProviders: "pending",
  }

  get providers() {
    return this.providersManager.providers
  }

  constructor(
    @Inject(TOKENS.Logger) public readonly logger: BaseLogger,
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.ProviderManager) public readonly providersManager: IProviderManager,
  ) {}

  get models(): IModel[] {
    return this.providers.flatMap(provider => provider.models)
  }

  get modelId() {
    return this.config.get<string>(SETTING_MODEL_ID)
  }

  get model() {
    return this.models.find(model => model.id === this.modelId)
  }

  selectModel(modelId: string) {
    this.config.update(SETTING_MODEL_ID, modelId)
  }

  async generateCommit(diff: DiffResult, options?: GenerateCommitOptions) {
    // Get selected model from config
    const modelId = this.config.get<string>(SETTING_MODEL_ID) ?? this.providers[0]?.models[0]?.id
    if (!modelId) {
      throw new Error("No model available")
    }

    const provider = this.providers.find(p => p.models.some(model => model.id === modelId))
    if (!provider) {
      throw new Error(`No provider found for model ${modelId}`)
    }

    const generateOptions = options || {
      lang: this.config.get("lang"),
    }

    return provider.generateCommit({ model: modelId, diff, options: generateOptions })
  }
}
