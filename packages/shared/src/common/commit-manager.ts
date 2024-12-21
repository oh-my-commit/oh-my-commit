import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import { SETTING_MODEL_ID } from "./app"
import type { IConfig, ILogger, IProviderManager } from "./core"
import { TOKENS } from "./core"
import type { BaseGenerateCommitProvider, GenerateCommitOptions } from "./generate-commit"
import { formatError } from "./utils"

export type Status = "pending" | "running" | "success" | "error"

@Service()
export class CommitManager {
  public providers: BaseGenerateCommitProvider[] = []
  public status: {
    loadingProviders: Status
  } = {
    loadingProviders: "pending",
  }
  private static instance: Promise<void> | null = null

  constructor(
    @Inject(TOKENS.Config) private readonly config: IConfig,
    @Inject(TOKENS.Logger) private readonly logger: ILogger,
    @Inject(TOKENS.ProviderManager) private readonly providersManager: IProviderManager,
  ) {}

  /**
   * 线程安全的初始化方法
   */
  private async initProviders() {
    if (!CommitManager.instance) {
      CommitManager.instance = (async () => {
        this.status.loadingProviders = "running"
        try {
          this.providers = await this.providersManager.init()
          this.logger.info(`Loaded ${this.providers.length} providers`)
          this.status.loadingProviders = "success"
        } catch (error) {
          this.logger.error(`Failed to load providers: ${formatError(error)}`)
          this.status.loadingProviders = "error"
        }
      })()
    }
    await CommitManager.instance
  }

  private async update(key: string, value: any) {
    try {
      await this.config.update(key, value, true)
    } catch (error) {
      this.logger.error(`Failed to update config: ${formatError(error)}`)
      throw error
    }
  }

  async generateCommit(diff: DiffResult, options?: GenerateCommitOptions) {
    // Initialize providers if not already done
    await this.initProviders()

    // Get selected model from config
    const modelId = this.config.get<string>(SETTING_MODEL_ID)
    const provider = modelId
      ? this.providers.find(p => p.models.some(model => model.id === modelId))
      : this.providers[0]

    if (!provider) {
      throw new Error(`No provider found${modelId ? ` for model ${modelId}` : ""}`)
    }

    const model = provider.models.find(model => model.id === modelId)
    if (!model) {
      this.logger.error(`Model ${modelId} not found`)
    }

    const generateOptions = options || {
      lang: this.config.get("lang"),
    }

    return provider.generateCommit({ model, diff, options: generateOptions })
  }
}
