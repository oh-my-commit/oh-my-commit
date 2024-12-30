/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createJiti } from "jiti"
import fs from "node:fs"
import path from "node:path"
import { Container, Inject, Service } from "typedi"

import type { BaseProvider, IConfig, IProviderManager } from "../common"
import { BaseLogger, ProviderSchema, TOKENS, formatError } from "../common"
import { PROVIDERS_DIR } from "./config"

const jiti = createJiti(__filename, {
  requireCache: false,
  interopDefault: true,
  extensions: [".ts", ".js", ".mjs", ".cjs", ".json"],
})

/**
 * Provider Registry manages all available commit message providers
 */
@Service()
export class ProviderRegistry implements IProviderManager {
  initialized = false
  providers: BaseProvider[] = []
  private providersDir = PROVIDERS_DIR

  constructor(@Inject(TOKENS.Logger) public readonly logger: BaseLogger) {}

  /** Load all providers from user directory */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.logger.debug(`Loading user providers from ${this.providersDir}`)
      if (!fs.existsSync(this.providersDir)) {
        this.logger.debug(`Creating providers directory: ${this.providersDir}`)
        fs.mkdirSync(this.providersDir, { recursive: true })
        return
      }

      const directories = fs.readdirSync(this.providersDir, {
        withFileTypes: true,
      })
      const providerDirs = directories.filter((dir) => dir.isDirectory())

      for (const dir of providerDirs) {
        this.logger.debug(`Loading provider from directory: ${dir.name}`)
        const filePath = path.join(this.providersDir, dir.name, "index.js")
        if (fs.existsSync(filePath)) {
          try {
            const provider = await this.loadProviderFromFile(filePath)
            if (provider) {
              this.registerProvider(provider)
            }
          } catch (error) {
            this.logger.error(`Failed to load provider from ${filePath}: ${error}`)
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to load providers: ${error}`)
    } finally {
      this.initialized = true
    }
  }

  /** Register a new provider */
  registerProvider(provider: BaseProvider): void {
    this.logger.debug(`Registering provider: ${provider.id}`)
    if (this.providers.some((p) => p.id === provider.id)) {
      this.logger.warn(`Provider with id ${provider.id} already exists. Skipping registration.`)
      return
    }
    this.providers.push(provider)
    this.logger.debug(`Successfully registered provider: ${provider.id}`)
  }

  private async loadProviderFromFile(filePath: string): Promise<BaseProvider | null> {
    try {
      const module = await jiti(filePath)
      const Provider =
        module.default || (module as new (context: { logger: BaseLogger; config: IConfig }) => BaseProvider)

      if (!Provider || typeof Provider !== "function") {
        this.logger.warn(`No default export found in ${filePath}`)
        return null
      }

      const provider = new Provider({
        logger: Container.get(TOKENS.Logger),
        config: Container.get(TOKENS.Config),
      })
      this.logger.debug(`Successfully instantiated provider: `, provider)

      ProviderSchema.parse(provider)
      return provider
    } catch (error) {
      this.logger.error(formatError(error, `Error loading provider from ${filePath}`))
      return null
    }
  }
}
