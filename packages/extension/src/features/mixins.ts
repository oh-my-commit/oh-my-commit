import { VscodeExtensionLogger } from "@/vscode-adapters"
import vscode from "vscode" // Constructor type with static members

// Constructor type with static members
export type Constructor<T = object> = abstract new (...args: any[]) => T

// Loggable mixin
export function Loggable<TBase extends Constructor>(Base: TBase) {
  abstract class LoggableClass extends Base {
    public config!: vscode.WorkspaceConfiguration
    public logger!: VscodeExtensionLogger

    constructor(...args: any[]) {
      super(...args)
      this.config = vscode.workspace.getConfiguration()
      this.logger = new VscodeExtensionLogger("host")
    }
  }

  return LoggableClass
}
