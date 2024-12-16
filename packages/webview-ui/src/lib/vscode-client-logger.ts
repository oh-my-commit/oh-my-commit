import {
  BaseLogger,
  formatMessage,
  LogLevel,
} from "@oh-my-commits/shared/common";
import { getVSCodeAPI } from "./storage";

export class VscodeClientLogger extends BaseLogger {
  private vscode = getVSCodeAPI();

  protected log(level: LogLevel, ...args: any[]) {
    const rawMessage = formatMessage(...args);

    this.vscode.postMessage({
      command: "log",
      payload: {
        channel: this.channel,
        level,
        rawMessage,
        sourceInfo: {
          isDevelopment: process.env.NODE_ENV === "development",
        },
      },
    });
  }
}

export const vscodeClientLogger = new VscodeClientLogger("Webview");
