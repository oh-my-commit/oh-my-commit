/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Service } from "typedi"
import vscode from "vscode"

import type { IConfig } from "@shared/common"

@Service()
export class VscodeConfig implements IConfig {
  get<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration().get<T>(key)
  }

  async update(key: string, value: unknown, global?: boolean): Promise<void> {
    await vscode.workspace.getConfiguration().update(key, value, global)
  }
}
