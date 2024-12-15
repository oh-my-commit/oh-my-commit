import { LogOutputChannel } from "vscode";

// Constructor type with static members
export type Constructor<T = {}> = abstract new (...args: any[]) => T;

// Loggable mixin
export function Loggable<TBase extends Constructor>(Base: TBase) {
  abstract class LoggableClass extends Base {
    protected static logger: LogOutputChannel;
    protected logger!: LogOutputChannel;

    public static setLogger(logger: LogOutputChannel) {
      this.logger = logger;
    }
  }
  return LoggableClass;
}
