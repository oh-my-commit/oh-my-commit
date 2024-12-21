import { VscodeLogger } from "@/vscode-commit-adapter"
import vscode from "vscode" // Constructor type with static members

// Constructor type with static members
export type Constructor<T = object> = abstract new (...args: any[]) => T

// Loggable mixin
export function Loggable<TBase extends Constructor>(Base: TBase) {
  abstract class LoggableClass extends Base {
    public config!: vscode.WorkspaceConfiguration
    public logger!: VscodeLogger

    constructor(...args: any[]) {
      super(...args)
      this.config = vscode.workspace.getConfiguration()
      this.logger = new VscodeLogger("host")
    }
  }

  return LoggableClass
}
