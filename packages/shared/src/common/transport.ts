/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffResult } from "simple-git"

import type { LogLevel } from "./log"
import type { IResult } from "./provider.interface"
import type { ResultDTO } from "./utils"

export type BaseClientMessageEvent =
  | {
      type: "ping"
    }
  | {
      type: "log"
      data: {
        channel?: string
        level: LogLevel
        rawMessage: any
      }
    }
  | {
      type: "close-window" // todo: or window-close ?
    }
  | {
      type: "open-external"
      data: {
        url: string
      }
    }
export type BaseServerMessageEvent =
  | { type: "pong" }
  | {
      type: "webpackProgress"
      data: {
        percent: number // 0-100
        msg: string
      }
    }

export type ClientMessageEvent_ =
  | BaseClientMessageEvent
  | {
      type: "init"
    }
  // 3. 用户挑选文件
  | {
      type: "selected-files"
      data?: string[]
    }
  // 4. 用户执行提交
  | {
      type: "commit"
    }
  | {
      type: "diff-file"
      data: {
        filePath: string
      }
    }

export type DiffFileResult = ResultDTO<{
  diff: string
}>

export type ServerMessageEvent =
  | BaseServerMessageEvent
  // 1. 用户打开 commit 界面， server --> client
  | {
      type: "diff-result"
      data: DiffResult
    }
  // 2. 异步生成的 commits，无论是初次，还是等用户挑选文件后的结果
  | {
      type: "commit-message"
      data: ResultDTO<IResult>
    }

  // 5. 提交结果
  | {
      type: "commit-result"
      data: ResultDTO<any>
    }
  | {
      type: "diff-file-result"
      data: DiffFileResult
    }

export type ClientMessageEvent = ClientMessageEvent_ & {
  channel?: string
}
