/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"

import type { CommitManager } from "./CommitManager"
import type { BaseLogger } from "./log"
import type { BaseProvider } from "./provider.interface"

export interface ILogger {
  info(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
}

export interface IConfig {
  get<T>(key: string): T | undefined
  update(key: string, value: unknown, global?: boolean): Promise<void>
}

export interface IProviderManager {
  providers: BaseProvider[]
  initialized?: boolean
  initialize(): Promise<void>
}

export interface IUIProvider {
  showError(message: string, ...actions: string[]): Promise<string | undefined>
  showInfo(message: string): Promise<string | undefined>
}

export const TOKENS = {
  Config: new Token<IConfig>("Config"),
  Logger: new Token<BaseLogger>("Logger"),
  ProviderManager: new Token<IProviderManager>("ProviderManager"),
  CommitManager: new Token<CommitManager>("CommitManager"),
  UIProvider: new Token<IUIProvider>("UIProvider"),
} as const
