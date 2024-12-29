/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { DiffResult } from "simple-git"

import type { DiffFileResult } from "@shared/common"

import { atomWithStorage } from "@/lib/storage"

// File changes state
export const diffResultAtom = atomWithStorage<DiffResult | null>({
  key: "oh-my-commit.commit.changed-files",
  defaultValue: null,
})

// Expanded directories list
export const expandedDirsAtom = atomWithStorage<string[]>({
  defaultValue: [],
  key: "oh-my-commit.commit.changed-files.expanded",
})

// Last opened file path
export const lastOpenedFilePathAtom = atomWithStorage<string | null>({
  defaultValue: null,
  key: "oh-my-commit.commit.changed-files.last-opened",
})

export const diffDetailAtom = atomWithStorage<DiffFileResult | null>({
  defaultValue: null,
  key: "oh-my-commit.commit.changed-files.diff-detail",
})

// View modes
export type ViewMode = "flat" | "tree"

export const viewModeAtom = atomWithStorage<ViewMode>({
  defaultValue: "flat",
  key: "oh-my-commit.commit.changed-files.view-mode",
  storageType: "localStorage",
})
