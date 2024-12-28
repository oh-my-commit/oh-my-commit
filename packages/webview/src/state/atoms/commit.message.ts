/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { atom } from "jotai"

import { atomWithStorage } from "@/lib/storage"

// 核心状态原子
export const commitTitleAtom = atomWithStorage({
  key: "oh-my-commit.commit.title",
  defaultValue: "",
  storageType: "none",
})

export const commitBodyAtom = atomWithStorage({
  key: "oh-my-commit.commit.body",
  defaultValue: "",
  storageType: "none",
})

export const isGeneratingAtom = atom(
  // 暂时默认为 false，之后可以根据实际情况进行调整
  false
)

export const isCommittingAtom = atom(false)
