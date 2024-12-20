import type { BaseGenerateCommitProvider, GenerateCommitInput } from "./generate-commit"

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

export interface IUIProvider {
  showError(message: string, ...actions: string[]): Promise<string | undefined>
  showInfo(message: string): void
}

export interface ICommitManager {
  providers: BaseGenerateCommitProvider[]
  generateCommit(input: GenerateCommitInput): Promise<string>
  selectModel(modelId: string): Promise<boolean>
}
