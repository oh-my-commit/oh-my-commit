import { VscodeExtensionLogger } from "@/libs/vscode-extension-logger";
import vscode from "vscode"; // Constructor type with static members

// Constructor type with static members
export type Constructor<T = {}> = abstract new (...args: any[]) => T;

// Loggable mixin
export function Loggable<TBase extends Constructor>(Base: TBase) {
  abstract class LoggableClass extends Base {
    public config = vscode.workspace.getConfiguration();
    public logger = new VscodeExtensionLogger("host");
  }

  return LoggableClass;
}
