import { APP_NAME, CommitManager, ConsoleLogger, TOKENS } from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import { Container, Inject, Service } from "typedi"
import { CliConfig } from "./cli-config"

@Service()
class CliLoggerService extends ConsoleLogger {
  constructor() {
    super(`${APP_NAME} Cli`)
  }
}

@Service()
class CliProviderRegistry extends ProviderRegistry {
  constructor(@Inject(TOKENS.Logger) logger: CliLoggerService) {
    super(logger)
  }
}

// 初始化 Container
export function initContainer() {
  // 1. 注册 config
  Container.set({ id: TOKENS.Config, value: new CliConfig() })

  // 2. 注册 logger 服务
  Container.set({ id: TOKENS.Logger, type: CliLoggerService })

  // 3. 注册 provider registry
  Container.set({ id: TOKENS.ProviderManager, type: CliProviderRegistry })

  // 4. 获取 CommitManager 实例
  return Container.get(CommitManager)
}

// 导出 CommitManager 实例
export let cliCommitManager: CommitManager
