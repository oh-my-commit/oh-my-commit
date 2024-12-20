import type { DiffResult } from "simple-git"
import type { GenerateCommitResult } from "./generate-commit"
import type { LogLevel } from "./log"
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
export type BaseServerMessageEvent = { type: "pong" }
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
      data: ResultDTO<GenerateCommitResult>
    }

  // 5. 提交结果
  | {
      type: "commit-result"
      data: ResultDTO<any>
    }
export type ClientMessageEvent = ClientMessageEvent_ & {
  channel?: string
}
