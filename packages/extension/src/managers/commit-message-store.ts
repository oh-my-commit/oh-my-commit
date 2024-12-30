/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Service } from "typedi"

import type { IResult, ResultDTO } from "@shared/common"

export interface ICommitMessageStore {
  setResult(result: ResultDTO<IResult> | null): void
  getResult(): ResultDTO<IResult> | null
}

@Service()
export class CommitMessageStore implements ICommitMessageStore {
  private result: ResultDTO<IResult> | null = null

  setResult(result: ResultDTO<IResult> | null): void {
    this.result = result
  }

  getResult(): ResultDTO<IResult> | null {
    return this.result
  }
}
