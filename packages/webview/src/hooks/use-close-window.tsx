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
