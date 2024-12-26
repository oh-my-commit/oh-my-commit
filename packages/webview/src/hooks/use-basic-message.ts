/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback } from "react"

import { useSetAtom } from "jotai"

import type { ServerMessageEvent } from "@shared/common"

import { progressAtom } from "@/state/atoms/progress"

import { useMessage } from "./use-message"

export const useBasicMessage = () => {
  const setProgress = useSetAtom(progressAtom)

  const handleBasicMessage = useCallback(
    (message: ServerMessageEvent) => {
      switch (message.type) {
        case "pong":
          // 处理 pong 消息
          break
        case "webpackProgress":
          if (message.data.percent === 100) {
            // 完成时隐藏进度条
            setProgress({ isVisible: false, percentage: 0 })
          } else {
            setProgress({
              isVisible: true,
              percentage: message.data.percent,
              message: message.data.msg,
            })
          }
          break
      }
    },
    [setProgress]
  )

  useMessage(handleBasicMessage)
}
