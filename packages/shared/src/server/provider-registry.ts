import type { ILogger, IProviderManager } from "@/common"
import { TOKENS } from "@/common"
import fs from "node:fs"
import path from "node:path"
import { Inject, Service } from "typedi"
import type { BaseGenerateCommitProvider } from "../common/generate-commit"
import { ProviderSchema } from "../common/generate-commit"
import { omcProvidersDir } from "./config"

/**
 * Provider Registry manages all available commit message providers
 */
@Service()
export class ProviderRegistry implements IProviderManager {
  private static instance: ProviderRegistry
  private providers = new Map<string, BaseGenerateCommitProvider>()
  private omcProvidersDir = omcProvidersDir

  constructor(@Inject(TOKENS.Logger) private readonly logger: ILogger) {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry()
    }
    return ProviderRegistry.instance
  }

  /** Initialize the registry and load all providers */
  async init(): Promise<BaseGenerateCommitProvider[]> {
    this.logger.debug("Initializing ProviderRegistry")
    await this.loadProviders()
    this.logger.debug(`Loaded ${this.providers.size} providers`)
    return Array.from(this.providers.values())
  }

  /** Load all providers from user directory */
  private async loadProviders() {
    this.logger.debug(`Loading user providers from ${this.omcProvidersDir}`)
    try {
      if (!fs.existsSync(this.omcProvidersDir)) {
        this.logger.debug(`Creating providers directory: ${this.omcProvidersDir}`)
        fs.mkdirSync(this.omcProvidersDir, { recursive: true })
        return
      }

      const directories = fs.readdirSync(this.omcProvidersDir, { withFileTypes: true })
      const providerDirs = directories.filter(dir => dir.isDirectory())

      for (const dir of providerDirs) {
        this.logger.debug(`Loading provider from directory: ${dir.name}`)
        const filePath = path.join(this.omcProvidersDir, dir.name, "index.js")
        if (fs.existsSync(filePath)) {
          const provider = await loadProviderFromFile(filePath)
          if (provider) {
            this.registerProvider(provider)
          } else {
            this.logger.warn(`Failed to load provider from ${filePath}: Invalid provider format`)
          }
        } else {
          this.logger.warn(`No index.js found in provider directory: ${dir.name}`)
        }
      }
    } catch (error) {
      this.logger.error(`Error loading providers: ${error}`)
      throw error
    }
  }

  /** Register a new provider */
  registerProvider(provider: BaseGenerateCommitProvider) {
    this.logger.debug(`Registering provider: ${provider.id}`)
    if (this.providers.has(provider.id)) {
      this.logger.warn(`Provider with id ${provider.id} already exists. Skipping registration.`)
      return
    }
    this.providers.set(provider.id, provider)
    this.logger.debug(`Successfully registered provider: ${provider.id}`)
  }

  /** Get provider by id */
  getProvider(id: string): BaseGenerateCommitProvider | undefined {
    const provider = this.providers.get(id)
    this.logger.debug(provider ? `Found provider: ${id}` : `Provider not found: ${id}`)
    return provider
  }

  /** Get all registered providers */
  getAllProviders(): BaseGenerateCommitProvider[] {
    this.logger.debug(`Retrieving all providers. Count: ${this.providers.size}`)
    return Array.from(this.providers.values())
  }
}

/** Load a provider from a file */
async function loadProviderFromFile(filePath: string): Promise<BaseGenerateCommitProvider | null> {
  console.log(`Attempting to load provider from file: ${filePath}`)
  try {
    const module = await import(filePath)
    // 支持 default export 和 module.exports
    const provider = module.default || module
    const ProviderClass = provider.default || provider

    // 如果是类，实例化它
    const instance = typeof ProviderClass === "function" ? new ProviderClass() : ProviderClass

    if (isValidProvider(instance)) {
      console.log(`Successfully loaded provider from ${filePath}`)
      return instance
    }
    console.warn(`Invalid provider structure in ${filePath}`)
    return null
  } catch (error) {
    console.error(`Failed to load provider from ${filePath}:`, error)
    return null
  }
}

/**
 * 验证对象是否为有效的 Provider
 * @param obj - 待验证的对象
 * @returns 是否为有效的 Provider
 */
function isValidProvider(obj: any): obj is BaseGenerateCommitProvider {
  if (!obj) {
    console.error("[Provider 验证失败] 对象为空")
    return false
  }

  const result = ProviderSchema.safeParse(obj)
  if (!result.success) {
    console.error("[Provider 验证失败] 字段校验错误:")

    // 格式化错误信息
    const errors = result.error.format()
    Object.entries(errors).forEach(([path, error]) => {
      if (path === "_errors") return
      console.error(`  - ${path}: ${(error as any)._errors.join(", ")}`)
    })

    return false
  }

  // 额外验证 generateCommit 方法
  if (typeof obj.generateCommit !== "function") {
    console.error("[Provider 验证失败] generateCommit 必须是一个函数")
    return false
  }

  console.log("[Provider 验证成功] 所有字段校验通过")
  return true
}
