/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { merge } from "lodash-es"
import fs from "node:fs"
import { Service } from "typedi"

import type { Config, IConfig } from "@shared/common"
import { configSchema, defaultConfig } from "@shared/common"
import { USERS_DIR, USER_CONFIG_PATH } from "@shared/server"

/**
 * Transform environment variables to config object
 * - Convert uppercase to camelCase
 * - Convert underscore to dot
 */
function transformEnvToConfig(env: NodeJS.ProcessEnv = process.env): Record<string, any> {
  const config: Record<string, any> = {}

  for (const [key, value] of Object.entries(env)) {
    if (!value) continue

    // Convert key to camelCase and dots
    const transformedKey = key
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/_/g, ".")

    // Build nested object structure
    const parts = transformedKey.split(".")
    let current = config

    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]!] = current[parts[i]!] || {}
      current = current[parts[i]!]
    }

    // Set the value, converting to appropriate type
    const lastPart = parts[parts.length - 1]!
    if (value.toLowerCase() === "true") current[lastPart] = true
    else if (value.toLowerCase() === "false") current[lastPart] = false
    else if (!isNaN(Number(value))) current[lastPart] = Number(value)
    else current[lastPart] = value
  }

  return config
}

@Service()
export class CliConfig implements IConfig {
  private config: Config = defaultConfig

  constructor() {
    this.loadConfig()
  }

  get<T>(key: string): T | undefined {
    return key.split(".").reduce((obj: any, k) => obj && obj[k], this.config) as T
  }

  async update(key: string, value: any, global = false): Promise<void> {
    const keys = key.split(".")
    const lastKey = keys.pop()!
    const target = keys.reduce((obj: any, k) => (obj[k] = obj[k] || {}), this.config)
    target[lastKey] = value

    if (global) {
      this.saveConfig()
    }
  }

  private loadConfig() {
    try {
      if (!fs.existsSync(USERS_DIR)) {
        fs.mkdirSync(USERS_DIR, { recursive: true })
      }

      if (fs.existsSync(USER_CONFIG_PATH)) {
        const userConfig = JSON.parse(fs.readFileSync(USER_CONFIG_PATH, "utf-8"))
        const envConfig = transformEnvToConfig()
        this.config = configSchema.parse(merge({}, defaultConfig, userConfig, envConfig))
      }
    } catch (error) {
      console.error("Failed to load config:", error)
      this.config = defaultConfig
    } finally {
      this.saveConfig()
    }
  }

  private saveConfig() {
    try {
      fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error("Failed to save config:", error)
    }
  }
}
