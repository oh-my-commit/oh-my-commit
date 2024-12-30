/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"

import type { CommitManager } from "./commit-manager"
import type { IConfig, ILogger, IProviderManager, IUIProvider } from "./core"

export const TOKENS = {
  Config: new Token<IConfig>("Config"),
  Logger: new Token<ILogger>("Logger"),
  ProviderManager: new Token<IProviderManager>("ProviderManager"),
  CommitManager: new Token<CommitManager>("CommitManager"),
  UIProvider: new Token<IUIProvider>("UIProvider"),
} as const
