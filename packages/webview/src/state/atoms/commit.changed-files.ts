/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffResult } from "simple-git"

import { atomWithStorage } from "@/lib/storage"

// 文件变更状态
export const diffResultAtom = atomWithStorage<DiffResult | null>({
  key: "oh-my-commit.commit.changed-files",
  defaultValue: null,
})

// 选中的文件路径列表
export const selectedFilesAtom = atomWithStorage<string[]>({
  defaultValue: [],
  key: "oh-my-commit.commit.changed-files.selected",
})

// 展开的目录列表
export const expandedDirsAtom = atomWithStorage<string[]>({
  defaultValue: [],
  key: "oh-my-commit.commit.changed-files.expanded",
})

// 最后打开的文件路径
export const lastOpenedFilePathAtom = atomWithStorage<string | null>({
  defaultValue: null,
  key: "oh-my-commit.commit.changed-files.last-opened",
})
