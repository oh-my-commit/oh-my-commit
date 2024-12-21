import { APP_NAME, CommitManager, ConsoleLogger, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import "reflect-metadata"
import { Container } from "typedi"
import { CliConfig } from "./cli-config"

// 配置依赖注入
Container.set(TOKENS.Config, new CliConfig())
Container.set(TOKENS.Logger, new ConsoleLogger(`${APP_NAME} Cli`))
Container.set(TOKENS.ProviderManager, new ProviderRegistry(Container.get(TOKENS.Logger)))

// 获取 CommitManager 实例
export const cliCommitManager = Container.get(CommitManager)
