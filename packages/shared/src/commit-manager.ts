import { SETTING_MODEL_ID } from "./app"
import type { IConfig, ILogger, IUIProvider } from "./core"
import {
  type BaseGenerateCommitProvider,
  type GenerateCommitInput,
  presetAiProviders,
} from "./generate-commit"

export class CommitManager {
  private providers: BaseGenerateCommitProvider[] = []

  constructor(
    private config: IConfig,
    private logger: ILogger,
    private uiProvider: IUIProvider,
  ) {}

  get models() {
    return this.providers.flatMap(p => p.models)
  }

  get modelId() {
    return this.config.get<string>(SETTING_MODEL_ID)
  }

  get model() {
    return this.models.find(model => model.id === this.modelId)
  }

  get provider() {
    return this.providers.find(p => p.models.some(model => model.id === this.modelId))
  }

  public async selectModel(modelId: string): Promise<boolean> {
    const model = this.models.find(s => s.id === modelId)

    if (!model) {
      this.logger.error(`Model ${modelId} not found`)
      return false
    }

    await this.config.update(SETTING_MODEL_ID, modelId, true)

    const providerId = model.providerId
    if (presetAiProviders.includes(providerId)) {
      const response = await this.uiProvider.showError(
        `使用该模型需要先填写目标 ${providerId.toUpperCase()}_API_KEY`,
        "Configure Now",
        "Configure Later",
      )

      if (response === "Configure Now") {
        // Platform specific configuration should be handled by the UI provider
        this.uiProvider.showInfo("Please configure your API key in the settings")
      }
    }

    return true
  }

  public async generateCommit(input: GenerateCommitInput) {
    const model = this.model
    this.logger.info("[CommitManager] Generating commit using model: ", model)
    if (!model) throw new Error("No model selected")

    const provider = this.provider
    this.logger.info("[CommitManager] Generating commit using provider: ", provider)
    if (!provider) throw new Error(`Provider ${this.model.providerId} not found`)

    this.logger.info("generateCommit: ", input)

    return await provider.generateCommit(input)
  }

  public registerProvider(provider: BaseGenerateCommitProvider) {
    this.providers.push(provider)
  }
}
