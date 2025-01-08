/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"

import {
  CommitManager,
  ICommitManager,
  type IInputOptions,
  type ILogger,
  type IPreference,
  type IProviderManager,
  type IResult,
  type ResultDTO,
} from "../common"
import type { IGitCore } from "./git"
import { TOKENS } from "./tokens"

export interface IGitCommitManager extends ICommitManager {
  generateCommit(): Promise<ResultDTO<IResult>>
}

@Service()
export class GitCommitManager extends CommitManager {
  constructor(
    @Inject(TOKENS.Logger) logger: ILogger,
    @Inject(TOKENS.Preference) config: IPreference,
    @Inject(TOKENS.ProviderManager) providerManager: IProviderManager,
    @Inject(TOKENS.GitManager) public readonly gitService: IGitCore
  ) {
    super(logger, config, providerManager)
  }

  async generateCommit(): Promise<ResultDTO<IResult>> {
    try {
      await this.gitService.stageAll()
    } catch (error) {
      console.error("Failed to stage changes:", error)
    }

    const diff = await this.gitService.getDiff()
    const options: IInputOptions = {
      lang: this.config.get<string>("ohMyCommit.git.lang"),
    }
    return this.generateCommitWithDiff(diff, options)
  }
}
