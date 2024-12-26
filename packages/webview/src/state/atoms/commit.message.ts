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
})
export const commitBodyAtom = atomWithStorage({
  key: "oh-my-commit.commit.body",
  defaultValue: "",
})

export const isGeneratingAtom = atom(
  // 为了提高用户体验，目前的机制是一旦 webview 初始化成功，
  // exntension 就会向 webview 发送初始 commit message
  // 所以默认为 true
  true,
)
