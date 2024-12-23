import { Token } from "typedi"
import type { BaseGenerateCommitProvider, CommitManager } from "./generate-commit"
import type { BaseLogger } from "./log"

export interface ILogger {
  info(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}

export interface IConfig {
  get<T>(key: string): T | undefined
  update(key: string, value: any, global?: boolean): Promise<void>
}

export interface IProviderManager {
  providers: BaseGenerateCommitProvider[]
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
