/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import vscode from "vscode"

import { VscodeLogger } from "@/vscode-commit-adapter"

// Constructor type with static members

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
