/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { GitFileChange } from "@shared/common"

export interface CommitState {
  message: string
  detail: string
  files: GitFileChange[]
  selectedFiles: string[]
  filesChanged: GitFileChange[]
}

export interface CommitStats {
  added: number
  modified: number
  deleted: number
  total: number
  additions: number
  deletions: number
}
