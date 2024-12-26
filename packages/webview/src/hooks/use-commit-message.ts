import { useCallback } from "react"

import type { ServerMessageEvent } from "@shared/common"
import { useSetAtom } from "jotai"

import { diffResultAtom } from "@/state/atoms/commit.changed-files"
import { commitBodyAtom, commitTitleAtom, isGeneratingAtom } from "@/state/atoms/commit.message"

import { useMessage } from "./use-message"

export const useCommitMessage = () => {
  const setTitle = useSetAtom(commitTitleAtom)
  const setBody = useSetAtom(commitBodyAtom)
  const setDiffResult = useSetAtom(diffResultAtom)
  const setIsGenerating = useSetAtom(isGeneratingAtom)

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
        case "commit-result":
          // 处理提交结果
          break
      }
    },
    [setTitle, setBody, setDiffResult, setIsGenerating],
  )

  useMessage(handleCommitMessage)

  return {
    setTitle,
    setBody,
    setIsGenerating,
  }
}
