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
    console.log("Initializing ProviderRegistry")
    await this.loadProviders()
    console.log(`Loaded ${this.providers.size} providers`)
    return Array.from(this.providers.values())
  }

  /** Load all providers from user directory */
  private async loadProviders() {
    console.log(`Loading user providers from ${this.omcProvidersDir}`)
    try {
      if (!fs.existsSync(this.omcProvidersDir)) {
        console.log(`Creating providers directory: ${this.omcProvidersDir}`)
        fs.mkdirSync(this.omcProvidersDir, { recursive: true })
        return
      }

      const directories = fs.readdirSync(this.omcProvidersDir, { withFileTypes: true })
      const providerDirs = directories.filter(dir => dir.isDirectory())

      for (const dir of providerDirs) {
        console.log(`Loading provider from directory: ${dir.name}`)
        const filePath = path.join(this.omcProvidersDir, dir.name, "index.js")
        if (fs.existsSync(filePath)) {
          const provider = await loadProviderFromFile(filePath)
          if (provider) {
            this.registerProvider(provider)
          } else {
            console.warn(`Failed to load provider from ${filePath}`)
          }
        } else {
          console.warn(`index.js not found in ${dir.name}`)
        }
      }
    } catch (error) {
      console.error("Failed to load user providers:", error)
    }
  }

  /** Register a new provider */
  registerProvider(provider: BaseGenerateCommitProvider) {
    console.log(`Registering provider: ${provider.id}`)
    if (this.providers.has(provider.id)) {
      console.warn(`Provider with id ${provider.id} already exists. Skipping registration.`)
      return
    }
    this.providers.set(provider.id, provider)
    console.log(`Successfully registered provider: ${provider.id}`)
  }

  /** Get provider by id */
  getProvider(id: string): BaseGenerateCommitProvider | undefined {
    const provider = this.providers.get(id)
    console.log(provider ? `Found provider: ${id}` : `Provider not found: ${id}`)
    return provider
  }

  /** Get all registered providers */
  getAllProviders(): BaseGenerateCommitProvider[] {
    console.log(`Retrieving all providers. Count: ${this.providers.size}`)
    return Array.from(this.providers.values())
  }
}

/** Load a provider from a file */
async function loadProviderFromFile(filePath: string): Promise<BaseGenerateCommitProvider | null> {
  console.log(`Attempting to load provider from file: ${filePath}`)
  try {
    const module = await import(filePath)
    const provider = module.default || module

    if (isValidProvider(provider)) {
      console.log(`Successfully loaded provider from ${filePath}`)
      return provider
    }
    console.warn(`Invalid provider structure in ${filePath}`)
    return null
  } catch (error) {
    console.error(`Failed to load provider from ${filePath}:`, error)
    return null
  }
}

/** Validate if an object is a valid provider */
function isValidProvider(obj: any): obj is BaseGenerateCommitProvider {
  if (!obj) {
    console.error("Provider validation failed: object is null or undefined")
    return false
  }

  const requiredProps = [
    // { name: "id", type: "string" },
    { name: "displayName", type: "string" },
    { name: "description", type: "string" },
    { name: "models", type: "array" },
    { name: "generateCommit", type: "function" },
  ]

  for (const prop of requiredProps) {
    if (prop.type !== "function") {
      console.log(`${prop.name}:`, obj[prop.name])
    }
    if (
      prop.type === "array" ? !Array.isArray(obj[prop.name]) : typeof obj[prop.name] !== prop.type
    ) {
      console.error(`Provider validation failed: '${prop.name}' is not a ${prop.type}`)
      return false
    }
  }

  console.log("Provider validation result: Valid")
  return true
}
