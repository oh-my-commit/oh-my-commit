import { getVSCodeAPI } from "./storage";

type LogLevel = "debug" | "info" | "warn" | "error" | "trace";

class Logger {
  private vscode = getVSCodeAPI();
  private channel = "default";

  private formatMessage(...args: any[]): string {
    return args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
  }

  private getCallerInfo(): { file: string; line: number; column: number } {
    const error = new Error();
    const stack = error.stack;
    if (!stack) return { file: "unknown", line: 0, column: 0 };

    // Get the caller's stack frame (index 3 since 0 is Error, 1 is getCallerInfo, 2 is log method)
    const frames = stack.split("\n");
    let callerFrame = frames[3] || "";

    if (!callerFrame) return { file: "unknown", line: 0, column: 0 };

    // Extract file and line info from the frame
    // Format: "    at SomeFunction (webpack://yaac-webview/./src/components/FileChanges.tsx?:46:14)"
    const match = callerFrame.match(
      /webpack:\/\/[^/]+\/\.\/src\/(.+?)(?:\?[^:]*)?:(\d+):(\d+)/
    );
    if (!match) return { file: "unknown", line: 0, column: 0 };

    const [, relativePath, line, column] = match;
    return {
      file: relativePath,
      line: parseInt(line, 10),
      column: parseInt(column, 10),
    };
  }

  private log(level: LogLevel, ...args: any[]) {
    const { file, line, column } = this.getCallerInfo();
    const rawMessage = this.formatMessage(...args);
    const messageWithLocation = `[${file}:${line}:${column}] ${rawMessage}`;

    this.vscode.postMessage({
      command: "log",
      payload: {
        channel: this.channel,
        level,
        rawMessage: messageWithLocation,
        sourceInfo: {
          file,
          line,
          column,
          isDevelopment: process.env.NODE_ENV === "development",
        },
      },
    });
  }

  debug(...args: any[]) {
    this.log("debug", ...args);
  }

  info(...args: any[]) {
    this.log("info", ...args);
  }

  warn(...args: any[]) {
    this.log("warn", ...args);
  }

  error(...args: any[]) {
    this.log("error", ...args);
  }

  trace(...args: any[]) {
    this.log("trace", ...args);
  }

  setChannel(channel: string) {
    this.channel = channel;
    this.info(`Logger channel set to: ${channel}`);
  }
}

export const logger = new Logger();
