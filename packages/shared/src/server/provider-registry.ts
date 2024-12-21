import fs from "node:fs"
import path from "node:path"
import { Inject, Service } from "typedi"
import type { BaseGenerateCommitProvider, ILogger, IProviderManager } from "../common"
import { ProviderSchema, TOKENS } from "../common"

import { PROVIDERS_DIR } from "./config"

/**
 * Provider Registry manages all available commit message providers
 */
@Service()
export class ProviderRegistry implements IProviderManager {
  private providers = new Map<string, BaseGenerateCommitProvider>()
  private providersDir = PROVIDERS_DIR

  constructor(@Inject(TOKENS.Logger) public readonly logger: ILogger) {}

  /** Initialize the registry and load all providers */
  async init(): Promise<BaseGenerateCommitProvider[]> {
    this.logger.debug("Initializing ProviderRegistry")
    await this.loadProviders()
    this.logger.debug(`Loaded ${this.providers.size} providers`)
    return Array.from(this.providers.values())
  }

  /** Load all providers from user directory */
  private async loadProviders(): Promise<void> {
    this.logger.debug(`Loading user providers from ${this.providersDir}`)
    try {
      if (!fs.existsSync(this.providersDir)) {
        this.logger.debug(`Creating providers directory: ${this.providersDir}`)
        fs.mkdirSync(this.providersDir, { recursive: true })
        return
      }

      const directories = fs.readdirSync(this.providersDir, { withFileTypes: true })
      const providerDirs = directories.filter(dir => dir.isDirectory())

      for (const dir of providerDirs) {
        this.logger.debug(`Loading provider from directory: ${dir.name}`)
        const filePath = path.join(this.providersDir, dir.name, "index.js")
        if (fs.existsSync(filePath)) {
          try {
            const provider = await loadProviderFromFile(filePath)
            if (provider) {
              this.registerProvider(provider)
            } else {
              this.logger.warn(`Failed to load provider from ${filePath}: Invalid provider format`)
            }
          } catch (error) {
            this.logger.error(`Error loading provider from ${filePath}: ${error}`)
          }
        } else {
          this.logger.warn(`No index.js found in provider directory: ${dir.name}`)
        }
      }
    } catch (error) {
      this.logger.error(`Error loading providers: ${error}`)
      // Don't throw error here, just log it
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
export async function loadProviderFromFile(
  filePath: string,
): Promise<BaseGenerateCommitProvider | null> {
  try {
    const module = await import(filePath)
    // 支持 default export 和 module.exports
    const provider = module.default || module
    const ProviderClass = provider.default || provider

    // 如果是类，实例化它
    const instance = typeof ProviderClass === "function" ? new ProviderClass() : ProviderClass

    if (isValidProvider(instance)) {
      return instance
    }
    return null
  } catch (error) {
    console.error(`Failed to load provider from ${filePath}:`, error)
    return null
  }
}

/** Validate if an object is a valid provider */
function isValidProvider(obj: any): obj is BaseGenerateCommitProvider {
  if (!obj) return false

  try {
    // 验证基本结构
    const result = ProviderSchema.safeParse(obj)
    return result.success
  } catch (error) {
    return false
  }
}
