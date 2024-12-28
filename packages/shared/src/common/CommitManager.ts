/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"

import { SETTING_MODEL_ID } from "./app"
import { type IConfig, type IProviderManager, TOKENS } from "./core"
import { BaseLogger } from "./log"
import {
  BaseProvider,
  type IInputOptions,
  type IModel,
  type IResult,
  ResultDTOSchema,
  type Status,
} from "./provider.interface"
import { type ResultDTO, formatError } from "./utils"

@Service()
export class CommitManager {
  public status: {
    loadingProviders: Status
  } = {
    loadingProviders: "pending",
  }

  get providers(): BaseProvider[] {
    return this.providersManager.providers
  }

  constructor(
    @Inject(TOKENS.Logger) public readonly logger: BaseLogger,
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.ProviderManager)
    public readonly providersManager: IProviderManager
  ) {}

  get models(): IModel[] {
    return this.providers.flatMap((provider) => provider.models)
  }

  get modelId(): string | undefined {
    return this.config.get<string>(SETTING_MODEL_ID)
  }

  get model(): IModel | undefined {
    return this.models.find((model) => model.id === this.modelId)
  }

  selectModel(modelId: string): void {
    this.config.update(SETTING_MODEL_ID, modelId)
  }

  async generateCommit(
    diff: DiffResult,
    options: IInputOptions
  ): Promise<ResultDTO<IResult>> {
    try {
      const modelId =
        this.config.get<string>(SETTING_MODEL_ID) ??
        this.providers[0]?.models[0]?.id
      if (!modelId) {
        return {
          ok: false,
          code: -1,
          message: "No model available",
        }
      }

      const provider = this.providers.find((p) =>
        p.models.some((model) => model.id === modelId)
      )
      if (!provider) {
        return {
          ok: false,
          code: -2,
          message: `No provider found for model ${modelId}`,
        }
      }

      this.logger.debug(`Generating commit using model: ${modelId}`)
      const result = await provider.generateCommit({
        model: modelId,
        diff,
        options,
      })

      const parsed = ResultDTOSchema.safeParse(result)
      if (!parsed.success) {
        this.logger.error("Invalid provider response:", parsed.error)
        return {
          ok: false,
          code: -3,
          message: `Provider returned invalid data: ${parsed.error.message}`,
        }
      }

      return parsed.data as ResultDTO<IResult>
    } catch (error: unknown) {
      this.logger.error("Failed to generate commit:", error)
      return {
        ok: false,
        code: -999,
        message: `[UNKNOWN ERROR] Failed to generate commit: ${formatError(error)}`,
      }
    }
  }
}
