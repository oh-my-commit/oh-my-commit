/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { PreferenceSchema } from "./config"
import { LogLevel } from "./log"
import type { IProvider } from "./provider.interface"

export interface ILogger {
  info(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void

  setLevel(level: LogLevel): void
}

export interface IPreference {
  loadPreference(): Promise<PreferenceSchema>
  get<T>(key: string): T | undefined
  update(key: string, value: unknown, global?: boolean): Promise<void>
}

export interface IProviderManager {
  providers: IProvider[]
  initialized?: boolean
  initialize(): Promise<void>
}

export interface IUIProvider {
  showError(message: string, ...actions: string[]): Promise<string | undefined>
  showInfo(message: string): Promise<string | undefined>
}
