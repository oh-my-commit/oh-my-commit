/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import _, { merge } from "lodash-es"
import fs from "node:fs"
import { Service } from "typedi"

import type { Config, IConfig } from "@shared/common"
import { configSchema, defaultConfig } from "@shared/common"
import { USERS_DIR, USER_CONFIG_PATH } from "@shared/server"

/**
 * Transform environment variables to config object
 * - Convert OHMYCOMMIT_ prefix to ohMyCommit.
 * - Convert uppercase to camelCase
 * - Convert underscore to dot
 */
function transformEnvToConfig(env: NodeJS.ProcessEnv = process.env): Record<string, any> {
  const config: Record<string, any> = {}

  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(env)) {
    if (key.endsWith("_API_KEY")) {
      key = key.split("_API_KEY")[0]!.toLowerCase()
      key = `ohMyCommit.ai.apiKeys.${key}`
    } else {
      key = _.camelCase(key)
    }
    config[key] = value
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
    const PREFIX = "ohMyCommit."
    if (key.startsWith(PREFIX)) {
      key = key.slice(PREFIX.length)
    }
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
      console.log("Loaded config:", this.config)
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
