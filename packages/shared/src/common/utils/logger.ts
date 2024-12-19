export type LogLevel = "debug" | "info" | "warn" | "error" | "trace";

export function formatMessage(...args: any[]): string {
  return args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ");
}

export abstract class BaseLogger {
  protected channel = "default";

  setChannel(channel: string) {
    this.channel = channel;
  }

  constructor(channel: string) {
    this.channel = channel;
  }

  protected abstract log(level: LogLevel, ...args: any[]): void;

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
}

export class ConsoleLogger extends BaseLogger {
  protected log(level: LogLevel, ...args: any[]) {
    console.log(
      `${new Date().toISOString()} ${level.toUpperCase()} | [${
        this.channel
      }] ${formatMessage(...args)}]`
    );
  }
}
