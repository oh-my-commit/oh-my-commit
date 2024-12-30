/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ClientMessageEvent } from "@shared/common"

import { getVSCodeAPI } from "../lib/getVSCodeAPI"

export function clientPush(command: string): void
export function clientPush(
  message: ClientMessageEvent & { channel?: string }
): void
export function clientPush(
  messageOrCommand: string | (ClientMessageEvent & { channel?: string })
): void {
  const vscode = getVSCodeAPI()
  if (typeof messageOrCommand === "string") {
    vscode.postMessage({
      type: "execute-command",
      command: messageOrCommand,
    })
  } else {
    vscode.postMessage(messageOrCommand)
  }
}
