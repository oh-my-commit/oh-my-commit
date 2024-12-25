import type { Config, IConfig } from "@shared/common"
import { configSchema, defaultConfig } from "@shared/common"
import { USERS_DIR, USER_CONFIG_PATH } from "@shared/server"
import { merge } from "lodash-es"
import fs from "node:fs"
import { Service } from "typedi"

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
        this.config = configSchema.parse(merge({}, defaultConfig, userConfig))
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
