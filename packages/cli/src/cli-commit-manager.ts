import {
  APP_NAME,
  CommitManager,
  ConsoleLogger,
  IProviderManager,
  type IConfig,
  type ILogger,
} from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { CliConfig } from "./cli-config"

export const cliCommitManager = CommitManager.create({
  createConfig(): IConfig {
    return new CliConfig()
  },
  createLogger(channel: string = `${APP_NAME} Cli`): ILogger {
    return new ConsoleLogger(channel)
  },

  createProvidersManager(): IProviderManager {
    return ProviderRegistry.getInstance()
  },
})
