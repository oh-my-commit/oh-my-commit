import { APP_NAME, CommitManager, ConsoleLogger, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container } from "typedi"
import { CliConfig } from "./cli-config"

// 配置依赖注入
const config = new CliConfig()
const logger = new ConsoleLogger(`${APP_NAME} Cli`)
const providerRegistry = new ProviderRegistry(logger)

Container.set(TOKENS.Config, config)
Container.set(TOKENS.Logger, logger)
Container.set(TOKENS.ProviderManager, providerRegistry)

// 获取 CommitManager 实例
export const cliCommitManager = Container.get(CommitManager)
