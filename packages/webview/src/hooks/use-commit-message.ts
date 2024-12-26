/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback } from "react"

import { useSetAtom } from "jotai"

import type { ServerMessageEvent } from "@shared/common"

import { diffDetailAtom, diffResultAtom } from "@/state/atoms/commit.changed-files"
import { commitBodyAtom, commitTitleAtom, isGeneratingAtom } from "@/state/atoms/commit.message"

import { useMessage } from "./use-message"

export const useCommitMessage = () => {
  const setTitle = useSetAtom(commitTitleAtom)
  const setBody = useSetAtom(commitBodyAtom)
  const setDiffResult = useSetAtom(diffResultAtom)
  const setIsGenerating = useSetAtom(isGeneratingAtom)
  const setDiffDetail = useSetAtom(diffDetailAtom)

  const handleCommitMessage = useCallback(
    (message: ServerMessageEvent) => {
      switch (message.type) {
        case "diff-result":
          setDiffResult(message.data)
          break
        case "commit-message":
          if (message.data.ok) {
            setTitle(message.data.data.title)
            setBody(message.data.data.body ?? "")
          }
          setIsGenerating(false)
          break
        case "diff-file-result":
          setDiffDetail(message.data)
          break
        case "commit-result":
          // 处理提交结果
          break
      }
    },
    [setTitle, setBody, setDiffResult, setIsGenerating, setDiffDetail],
  )

  useMessage(handleCommitMessage)

  return {
    setTitle,
    setBody,
    setIsGenerating,
  }
}
