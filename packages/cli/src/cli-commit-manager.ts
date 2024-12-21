import { APP_NAME, CommitManager, ConsoleLogger, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container } from "typedi"
import { CliConfig } from "./cli-config"

// 配置依赖注入
Container.set({
  id: TOKENS.Config,
  value: new CliConfig(),
})

Container.set({
  id: TOKENS.Logger,
  value: new ConsoleLogger(`${APP_NAME} Cli`),
})

Container.set({
  id: TOKENS.ProviderManager,
  value: new ProviderRegistry(Container.get(TOKENS.Logger)),
})

// 获取 CommitManager 实例
export const cliCommitManager = Container.get(CommitManager)
