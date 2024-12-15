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

  private log(level: LogLevel, ...args: any[]) {
    const rawMessage = this.formatMessage(...args);

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
