/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useEffect } from "react"

import { useAtom } from "jotai/index"

import { getVSCodeAPI } from "@/lib/getVSCodeAPI"
import { uiModeAtom } from "@/state/atoms/ui"

export const useCloseWindow = () => {
  const [uiMode] = useAtom(uiModeAtom)
  const vscode = getVSCodeAPI()

  useEffect(() => {
    if (uiMode === "window") {
      const handleClose = () => {
        vscode.postMessage({ type: "window-close" })
      }
      window.addEventListener("beforeunload", handleClose)
      return () => window.removeEventListener("beforeunload", handleClose)
    }
    return () => {}
  }, [uiMode])
}
