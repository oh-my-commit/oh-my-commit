import { LogOutputChannel } from "vscode";

export abstract class LoggableBase {
  protected static logger: LogOutputChannel;

  public static setLogger(logger: LogOutputChannel) {
    this.logger = logger;
  }

  protected get logger(): LogOutputChannel {
    return (this.constructor as typeof LoggableBase).logger;
  }
}
