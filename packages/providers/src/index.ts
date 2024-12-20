import { OmcProvider } from "@/providers/omc-provider"
import type { GenerateCommitError, GenerateCommitInput, GenerateCommitResult, Model } from "@shared"
import * as fs from "fs"
import type { ResultAsync } from "neverthrow"
import * as os from "os"
import * as path from "path"

/**
 * Core interfaces for commit message generation providers
 */

export interface ICommitProvider {
  /** Unique identifier for the provider */
  id: string

  /** Display name shown to users */
  displayName: string

  /** Provider description */
  description: string

  /** Available models supported by this provider */
  models: Model[]

  /** Provider metadata */
  metadata?: {
    version: string
    author: string
    homepage?: string
    repository?: string
  }

  /** Generate commit message implementation */
  generateCommit(input: GenerateCommitInput): ResultAsync<GenerateCommitResult, GenerateCommitError>
}

/**
 * Provider Registry manages all available commit message providers
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry
  private providers: Map<string, ICommitProvider> = new Map()
  private userProvidersDir: string

  private constructor() {
    this.userProvidersDir = getUserProvidersDir()
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry()
    }
    return ProviderRegistry.instance
  }

  /** Initialize the registry and load all providers */
  async initialize() {
    // Register built-in providers
    this.registerProvider(new OmcProvider())

    // Load user providers
    await this.loadUserProviders()
  }

  /** Load all providers from user directory */
  private async loadUserProviders() {
    try {
      // Create providers directory if it doesn't exist
      if (!fs.existsSync(this.userProvidersDir)) {
        fs.mkdirSync(this.userProvidersDir, { recursive: true })
        return
      }

      const files = fs.readdirSync(this.userProvidersDir)
      const providerFiles = files.filter(f => f.endsWith(".js") || f.endsWith(".ts"))

      for (const file of providerFiles) {
        const filePath = path.join(this.userProvidersDir, file)
        const provider = await loadProviderFromFile(filePath)

        if (provider) {
          this.registerProvider(provider)
        }
      }
    } catch (error) {
      console.error("Failed to load user providers:", error)
    }
  }

  /** Register a new provider */
  registerProvider(provider: ICommitProvider) {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider with id ${provider.id} already exists`)
    }
    this.providers.set(provider.id, provider)
  }

  /** Get provider by id */
  getProvider(id: string): ICommitProvider | undefined {
    return this.providers.get(id)
  }

  /** Get all registered providers */
  getAllProviders(): ICommitProvider[] {
    return Array.from(this.providers.values())
  }
}

/** Get user providers directory path */
export function getUserProvidersDir(): string {
  const homeDir = os.homedir()
  return path.join(homeDir, ".oh-my-commit", "providers")
}

/** Load a provider from a file */
async function loadProviderFromFile(filePath: string): Promise<ICommitProvider | null> {
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
function isValidProvider(obj: any): obj is ICommitProvider {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.displayName === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.models) &&
    typeof obj.generateCommit === "function"
  )
}
