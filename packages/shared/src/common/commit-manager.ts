import "reflect-metadata"

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
  private static initPromise: Promise<void> | null = null

  constructor(
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.Logger) public readonly logger: ILogger,
    @Inject(TOKENS.ProviderManager) private readonly providersManager: IProviderManager,
  ) {}

  get models() {
    return this.providers.flatMap(provider => provider.models)
  }

  /**
   * 线程安全的初始化方法
   */
  public async initProviders() {
    if (!CommitManager.initPromise) {
      CommitManager.initPromise = this.doInitProviders()
    }
    try {
      await CommitManager.initPromise
    } catch (error) {
      // Reset initPromise so we can try again
      CommitManager.initPromise = null
      throw error
    }
  }

  private async doInitProviders() {
    this.status.loadingProviders = "running"
    try {
      this.providers = await this.providersManager.init()
      this.logger.info(`Loaded ${this.providers.length} providers`)
      this.status.loadingProviders = "success"
    } catch (error) {
      this.logger.error(`Failed to load providers: ${formatError(error)}`)
      this.status.loadingProviders = "error"
      throw error // Re-throw to propagate the error
    }
  }

  async generateCommit(diff: DiffResult, options?: GenerateCommitOptions) {
    // Initialize providers if not already done
    await this.initProviders()

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
