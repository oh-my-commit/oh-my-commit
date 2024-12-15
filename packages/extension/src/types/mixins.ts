import vscode, { LogOutputChannel } from "vscode";

// Constructor type with static members
export type Constructor<T = {}> = abstract new (...args: any[]) => T;

// Loggable mixin
export function Loggable<TBase extends Constructor>(Base: TBase) {
  abstract class LoggableClass extends Base {
    public logger: LogOutputChannel = vscode.window.createOutputChannel(
      "Oh My Commits",
      {
        log: true,
      }
    );

    public setLogger(logger: LogOutputChannel) {
      this.logger = logger;
    }
  }
  return LoggableClass;
}
