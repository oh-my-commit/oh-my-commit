/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"

import { TOKENS as COMMON_TOKENS } from "../common"
import { IGitCore } from "./git"
import { IGitCommitManager } from "./git-commit-manager"

export const TOKENS = {
  ...COMMON_TOKENS,
  GitManager: new Token<IGitCore>("GitManager"),
  GitCommitManager: new Token<IGitCommitManager>("GitCommitManager"),
}
