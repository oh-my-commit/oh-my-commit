import { IProviderManager } from "@/common"
import fs from "node:fs"
import path from "node:path"
import { BaseGenerateCommitProvider } from "../common/generate-commit"
import { omcProvidersDir } from "./config"

/**
 * Provider Registry manages all available commit message providers
 */
export class ProviderRegistry implements IProviderManager {
  private static instance: ProviderRegistry
  private providers = new Map<string, BaseGenerateCommitProvider>()
  private omcProvidersDir = omcProvidersDir

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry()
    }
    return ProviderRegistry.instance
  }

  /** Initialize the registry and load all providers */
  async init(): Promise<BaseGenerateCommitProvider[]> {
    // Register built-in providers
    // this.registerProvider()

    // Load user providers
    await this.loadProviders()
    return Object.values(this.providers)
  }

  /** Load all providers from user directory */
  private async loadProviders() {
    try {
      // Create providers directory if it doesn't exist
      if (!fs.existsSync(this.omcProvidersDir)) {
        fs.mkdirSync(this.omcProvidersDir, { recursive: true })
        return
      }

      const directories = fs.readdirSync(this.omcProvidersDir, { withFileTypes: true })
      const providerDirs = directories.filter(dir => dir.isDirectory())

      for (const dir of providerDirs) {
        console.log(`Loading provider: ${dir.name}`)
        const filePath = path.join(this.omcProvidersDir, dir.name, "index.js")
        if (fs.existsSync(filePath)) {
          const provider = await loadProviderFromFile(filePath)
          if (provider) {
            this.registerProvider(provider)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user providers:", error)
    }
  }

  /** Register a new provider */
  registerProvider(provider: BaseGenerateCommitProvider) {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider with id ${provider.id} already exists`)
    }
    this.providers.set(provider.id, provider)
  }

  /** Get provider by id */
  getProvider(id: string): BaseGenerateCommitProvider | undefined {
    return this.providers.get(id)
  }

  /** Get all registered providers */
  getAllProviders(): BaseGenerateCommitProvider[] {
    return Array.from(this.providers.values())
  }
}

/** Load a provider from a file */
async function loadProviderFromFile(filePath: string): Promise<BaseGenerateCommitProvider | null> {
  try {
    const module = await import(filePath)
    const provider = module.default || module

    if (isValidProvider(provider)) {
      return provider
    }
    return null
  } catch (error) {
    console.error(`Failed to load provider from ${filePath}:`, error)
    return null
  }
}

/** Validate if an object is a valid provider */
function isValidProvider(obj: any): obj is BaseGenerateCommitProvider {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.displayName === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.models) &&
    typeof obj.generateCommit === "function"
  )
}
