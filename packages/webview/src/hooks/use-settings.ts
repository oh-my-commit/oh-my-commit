/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback } from "react"

import { useAtom } from "jotai"

import type { ServerMessageEvent } from "@shared/common"

import { type CommitLanguage, commitLanguageAtom } from "@/state/atoms/settings"

import { useMessage } from "./use-message"

export const useSettings = () => {
  const [commitLanguage, setCommitLanguage] = useAtom(commitLanguageAtom)

  const handleSettingsMessage = useCallback(
    (message: ServerMessageEvent) => {
      switch (message.type) {
        case "settings-value":
        case "settings-updated":
          if (message.data.section === "git.commitLanguage") {
            setCommitLanguage(message.data.value as CommitLanguage)
          }
          break
      }
    },
    [setCommitLanguage]
  )

  useMessage(handleSettingsMessage)

  const updateCommitLanguage = useCallback(
    (value: CommitLanguage) => {
      setCommitLanguage(value)
    },
    [setCommitLanguage]
  )

  return {
    commitLanguage,
    updateCommitLanguage,
  }
}
