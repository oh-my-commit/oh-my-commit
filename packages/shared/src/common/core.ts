import "reflect-metadata"

import type { BaseGenerateCommitProvider } from "@/common/generate-commit"
import { Container, Inject, Service, Token } from "typedi"

export const TOKENS = {
  Config: new Token<IConfig>("Config"),
  Logger: new Token<ILogger>("Logger"),
  ProviderManager: new Token<IProviderManager>("ProviderManager"),
} as const

@Service()
export class AppContainer {
  private static instance: AppContainer

  static getInstance(): AppContainer {
    if (!AppContainer.instance) {
      AppContainer.instance = Container.get(AppContainer)
    }
    return AppContainer.instance
  }

  constructor(
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.Logger) public readonly logger: ILogger,
    @Inject(TOKENS.ProviderManager) public readonly providerManager: IProviderManager,
  ) {}
}

export interface IConfig {
  get<T>(key: string): T | undefined
  update(key: string, value: any, global?: boolean): Promise<void>
}

export interface ILogger {
  info(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}

export interface IProviderManager {
  init(): Promise<BaseGenerateCommitProvider[]>
}

export interface IUIProvider {
  showError(message: string, ...actions: string[]): Promise<string | undefined>
  showInfo(message: string): Promise<string | undefined>
}
