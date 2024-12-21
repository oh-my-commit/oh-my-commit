import { IConfig } from "@shared/common"
import { omcConfigPath, omcUserDir } from "@shared/server"
import fs from "node:fs"

export class CliConfig implements IConfig {
  private config: Record<string, any> = {}

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    try {
      if (!fs.existsSync(omcUserDir)) {
        fs.mkdirSync(omcUserDir, { recursive: true })
      }

      if (fs.existsSync(omcConfigPath)) {
        const content = fs.readFileSync(omcConfigPath, "utf-8")
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
      fs.writeFileSync(omcConfigPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error("Failed to save config:", error)
    }
  }

  get<T>(key: string): T | undefined {
    return this.config[key] as T
  }

  async update(key: string, value: any, global?: boolean): Promise<void> {
    this.config[key] = value
    this.saveConfig()
  }
}
