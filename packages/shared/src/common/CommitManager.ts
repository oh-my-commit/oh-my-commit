import { ResultAsync } from "neverthrow"
import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import { SETTING_MODEL_ID } from "./app"
import { TOKENS, type IConfig, type IProviderManager } from "./core"
import { BaseLogger } from "./log"
import {
  GenerateCommitError,
  type GenerateCommitOptions,
  type GenerateCommitResult,
  type IModel,
  type Status,
} from "./provider.interface"
import { formatError } from "./utils"

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

  generateCommit(
    diff: DiffResult,
    options?: GenerateCommitOptions,
  ): ResultAsync<GenerateCommitResult, GenerateCommitError> {
    return ResultAsync.fromPromise(
      (async () => {
        const modelId =
          this.config.get<string>(SETTING_MODEL_ID) ?? this.providers[0]?.models[0]?.id
        if (!modelId) {
          throw new GenerateCommitError(-1, "No model available")
        }

        const provider = this.providers.find(p => p.models.some(model => model.id === modelId))
        if (!provider) {
          throw new GenerateCommitError(-2, `No provider found for model ${modelId}`)
        }

        const generateOptions = options || {
          lang: this.config.get("lang"),
        }

        this.logger.info(`Generating commit using model: ${modelId}`)
        return provider.generateCommit({ model: modelId, diff, options: generateOptions })
      })(),
      error => {
        this.logger.error("Failed to generate commit:", error)
        return error instanceof GenerateCommitError
          ? error
          : new GenerateCommitError(
              -999,
              `[UNKNOWN ERRROR] Failed to generate commit: ${formatError(error)}`,
            )
      },
    ).andThen(result => result)
  }
}
