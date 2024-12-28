/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { DiffNameStatus } from "simple-git"

export const STATUS_COLORS: Record<DiffNameStatus, string> = {
  A: "text-git-added-fg",
  M: "text-git-modified-fg",
  D: "text-git-deleted-fg",
  R: "text-git-renamed-fg",
  C: "text-git-copied-fg",
  U: "text-git-unmerged-fg",
  X: "text-git-unknown-fg",
  B: "text-git-broken-fg",
  T: "text-git-changed-fg",
} as const

// View modes
export type ViewMode = "flat" | "tree"
