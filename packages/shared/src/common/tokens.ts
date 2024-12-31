/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"

import type { ICommitManager } from "./commit-manager"
import type { ILogger, IPreference, IProviderManager, IUIProvider } from "./core"

export const TOKENS = {
  Preference: new Token<IPreference>("Preference"),
  Logger: new Token<ILogger>("Logger"),
  ProviderManager: new Token<IProviderManager>("ProviderManager"),
  CommitManager: new Token<ICommitManager>("CommitManager"),
  UIProvider: new Token<IUIProvider>("UIProvider"),
} as const
