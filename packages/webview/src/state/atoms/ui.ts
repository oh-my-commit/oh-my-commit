/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ViewMode } from "@/components/commit/file-changes/constants"
import { atomWithStorage } from "@/lib/storage"

// 视图模式
export const viewModeAtom = atomWithStorage<ViewMode>({
  key: "oh-my-commit.commit.view-mode",
  defaultValue: "flat",
})

// 是否换行
export const diffWrapLineAtom = atomWithStorage<boolean>({
  key: "oh-my-commit.commit.diff-wrap-line",
  defaultValue: false,
})

export type UiMode = "silent" | "notification" | "window" | "panel"
export const uiModeAtom = atomWithStorage<UiMode>({
  key: "oh-my-commit.ui.mode",
  defaultValue: "window",
  storageType: "both",
})
