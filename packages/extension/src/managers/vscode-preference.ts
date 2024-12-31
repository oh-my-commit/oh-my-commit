/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { merge } from "lodash-es"
import { Service } from "typedi"
import vscode from "vscode"

import { APP_ID_CAMEL, type IPreference, defaultPreference, preferenceSchema } from "@shared/common"
import { BasePreference } from "@shared/server"

@Service()
export class VscodePreference extends BasePreference implements IPreference {
  override getPreference<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration().get<T>(key)
  }

  override loadPreference() {
    try {
      // override order: default <-- workspace
      return preferenceSchema.parse(merge({}, defaultPreference, vscode.workspace.getConfiguration().get(APP_ID_CAMEL)))
    } catch (error) {
      // @ts-expect-error ...
      this.logger.error(error)

      return preferenceSchema.parse(vscode.workspace.getConfiguration().get(APP_ID_CAMEL))
    }
  }

  override async updatePreference(key: string, value: unknown, global?: boolean): Promise<void> {
    await vscode.workspace.getConfiguration().update(key, value, global)
  }
}
