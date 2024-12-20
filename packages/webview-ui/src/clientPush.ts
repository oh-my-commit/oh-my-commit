import { ClientMessageEvent } from "@shared"
import { getVSCodeAPI } from "./lib/getVSCodeAPI"

export const clientPush = (message: ClientMessageEvent & { channel?: string }) => {
  // vscodeClientLogger.info(message);
  const vscode = getVSCodeAPI()
  vscode.postMessage(message)
}
