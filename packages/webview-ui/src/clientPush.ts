import { ClientMessageEvent } from "@oh-my-commits/shared";
import { getVSCodeAPI } from "./lib/storage";

export const clientPush = (
  message: ClientMessageEvent & { channel?: string }
) => {
  // vscodeClientLogger.info(message);
  const vscode = getVSCodeAPI();
  vscode.postMessage(message);
};
