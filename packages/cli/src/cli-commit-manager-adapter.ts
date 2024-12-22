import type { IConfig } from "@shared/common"
import { USERS_DIR, USER_CONFIG_PATH } from "@shared/server"
import fs from "node:fs"
import { Service } from "typedi"

@Service()
export class CliConfig implements IConfig {
  private config: Record<string, any> = {}

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    try {
      if (!fs.existsSync(USERS_DIR)) {
        fs.mkdirSync(USERS_DIR, { recursive: true })
      }

      if (fs.existsSync(USER_CONFIG_PATH)) {
        const content = fs.readFileSync(USER_CONFIG_PATH, "utf-8")
        this.config = JSON.parse(content)
      } else {
        // 创建默认配置
        this.config = {}
        this.saveConfig()
      }
    } catch (error) {
      console.error("Failed to load config:", error)
    }
  }

  private saveConfig() {
    try {
      fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error("Failed to save config:", error)
    }
  }

  get<T>(key: string): T | undefined {
    return this.config[key] as T
  }

  async update(key: string, value: any, _global?: boolean): Promise<void> {
    this.config[key] = value
    this.saveConfig()
  }
}
