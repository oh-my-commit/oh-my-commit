/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ClientMessageEvent } from "@shared/common"

import { getVSCodeAPI } from "../lib/getVSCodeAPI"

export const clientPush = (
  message: ClientMessageEvent & { channel?: string }
) => {
  // 不能开这个
  // vscodeClientLogger.info(message)
  const vscode = getVSCodeAPI()
  vscode.postMessage(message)
}
