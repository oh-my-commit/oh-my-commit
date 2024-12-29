/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback } from "react"

import { useSetAtom } from "jotai"

import type { ServerMessageEvent } from "@shared/common"

import {
  diffDetailAtom,
  diffResultAtom,
} from "@/state/atoms/commit.changed-files"
import {
  commitBodyAtom,
  commitTitleAtom,
  isCommittingAtom,
  isGeneratingAtom,
} from "@/state/atoms/commit.message"
import { gitStatusAtom } from "@/state/atoms/git"

import { useMessage } from "./use-message"

export const useCommitMessage = () => {
  const setTitle = useSetAtom(commitTitleAtom)
  const setBody = useSetAtom(commitBodyAtom)
  const setDiffResult = useSetAtom(diffResultAtom)
  const setIsGenerating = useSetAtom(isGeneratingAtom)
  const setIsCommitting = useSetAtom(isCommittingAtom)
  const setDiffDetail = useSetAtom(diffDetailAtom)
  const setGitStatus = useSetAtom(gitStatusAtom)

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
          setIsCommitting(false)
          if (message.data.ok) {
            // Clear the form on successful commit
            setTitle("")
            setBody("")
            setDiffResult({
              changed: 0,
              deletions: 0,
              insertions: 0,
              files: [],
            })
          }
          break

        case "git-status":
          setGitStatus(message.data)
          break
      }
    },
    [
      setTitle,
      setBody,
      setDiffResult,
      setIsGenerating,
      setIsCommitting,
      setDiffDetail,
      setGitStatus,
    ]
  )

  useMessage(handleCommitMessage)

  return {
    setTitle,
    setBody,
    setIsGenerating,
    setIsCommitting,
  }
}
