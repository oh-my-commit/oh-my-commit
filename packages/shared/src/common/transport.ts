/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
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

export type ClientMessageEvent =
  | BaseClientMessageEvent
  | {
      type: "init"
      channel?: string
    }
  | {
      type: "execute-command"
      command: string
      data?: any
    }
  | {
      type: "show-info"
      data: {
        message: string
      }
    }
  | {
      type: "get-settings"
      data: {
        section: string
      }
    }
  | {
      type: "update-settings"
      data: {
        section: string
        value: any
      }
    }
  // 3. 用户挑选文件
  | {
      type: "selected-files"
      data?: string[]
    }
  // 4. 用户执行提交
  | {
      type: "commit"
      data: {
        title: string
        body: string
      }
    }
  | {
      type: "diff-file"
      data: {
        filePath: string
      }
    }
  | {
      type: "generate"
    }

export type DiffFileResult = ResultDTO<{
  diff: string
}>

export type ServerMessageEvent =
  | BaseServerMessageEvent
  | {
      type: "settings-updated"
      data: {
        section: string
        value: any
      }
    }
  | {
      type: "settings-value"
      data: {
        section: string
        value: any
      }
    }
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
  | {
      type: "workspace-status"
      data: {
        isGitRepository: boolean
        workspaceRoot: string | undefined
        isWorkspaceValid: boolean
        error?: string
      }
    }

export interface WorkspaceStatus {
  isValid?: boolean
  isGitRepository?: boolean
  error?: string
}

export interface BasicMessage {
  type: "init" | "git-status" | "workspace-status"
  channel?: string
  data?: {
    gitStatus?: any
    workspaceStatus?: WorkspaceStatus
  }
}
