/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-31
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { merge } from "lodash-es"
import fs from "node:fs"
import { Inject, Service } from "typedi"

import {
  type Config,
  type ILogger,
  IPreference,
  PreferenceSchema,
  TOKENS,
  defaultPreference,
  normalizeLogLevel,
  preferenceSchema,
} from "../common"
import { USERS_DIR, USER_CONFIG_PATH } from "./path.map"

@Service()
export abstract class BasePreference implements IPreference {
  _preference: PreferenceSchema = defaultPreference

  constructor(@Inject(TOKENS.Logger) protected logger: ILogger) {
    if (!fs.existsSync(USERS_DIR)) {
      fs.mkdirSync(USERS_DIR, { recursive: true })
    }
    this.loadPreference().then((userConfig) => {
      this._preference = preferenceSchema.parse(merge({}, defaultPreference, userConfig))
    })
    // set level after config
    this.logger.setLevel(normalizeLogLevel(this.get("log.level")))
    // then log
    this.logger.debug(`loaded config: `, this._preference)
  }

  abstract getPreference<T>(key: string): T | undefined

  get<T>(key: string): T | undefined {
    return this.getPreference(key)
  }

  async update(key: string, value: unknown, global?: boolean): Promise<void> {
    await this.updatePreference(key, value, global)
    this._preference = merge({}, this._preference, { [key]: value })
    this.savePreference()
  }

  abstract updatePreference(key: string, value: unknown, global?: boolean): Promise<void>

  abstract loadPreference(): Promise<PreferenceSchema>

  // todo: save preference before exit
  private savePreference() {
    try {
      fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(this._preference, null, 2))
    } catch (error) {
      console.error("Failed to save config:", error)
    }
  }
}

// 安全地获取环境变量
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key]
  }
  return undefined
}
const proxyUrl = getEnvVar("HTTPS_PROXY") ?? getEnvVar("HTTP_PROXY")
export const envConfig = preferenceSchema.parse({
  log: {
    level: normalizeLogLevel(getEnvVar("LOG_LEVEL")),
  },
  basic: {
    enabled: getEnvVar("OMC_BASIC_ENABLED") === "true",
    uiLanguage: getEnvVar("OMC_BASIC_UI_LANGUAGE") ?? "system",
  },
  model: {
    id: getEnvVar("OMC_MODEL_ID") ?? "ohMyCommit.standard",
  },
  git: {
    emptyChangeBehavior: getEnvVar("OMC_GIT_EMPTY_CHANGE_BEHAVIOR") ?? "skip",
    autoStage: getEnvVar("OMC_GIT_AUTO_STAGE") === "true",
    commitLanguage: getEnvVar("OMC_GIT_COMMIT_LANGUAGE") ?? "system",
  },
  ui: {
    mode: getEnvVar("OMC_UI_MODE") ?? "window",
  },
  proxy: {
    url: proxyUrl,
    enabled: !!proxyUrl,
  },
  apiKeys: {
    anthropic: getEnvVar("ANTHROPIC_API_KEY"),
    openai: getEnvVar("OPENAI_API_KEY"),
    cohere: getEnvVar("COHERE_API_KEY"),
    huggingface: getEnvVar("HUGGINGFACE_API_KEY"),
    google: getEnvVar("GOOGLE_API_KEY"),
    zhipu: getEnvVar("ZHIPU_API_KEY"),
    deepseek: getEnvVar("DEEPSEEK_API_KEY"),
    groq: getEnvVar("GROQ_API_KEY"),
    baichuan: getEnvVar("BAICHUAN_API_KEY"),
  },
  telemetry: {
    enabled: getEnvVar("OMC_TELEMETRY_ENABLED") === "true",
    shareLevel: getEnvVar("OMC_TELEMETRY_SHARE_LEVEL") ?? "basic",
  },
  feedback: {
    enabled: getEnvVar("OMC_FEEDBACK_ENABLED") === "true",
  },
})

@Service()
export class CliConfig extends BasePreference implements IPreference {
  private config: Config = defaultPreference

  override getPreference<T>(key: string): T | undefined {
    const PREFIX = "ohMyCommit."
    if (key.startsWith(PREFIX)) {
      key = key.slice(PREFIX.length)
    }
    return key.split(".").reduce((obj: any, k) => obj && obj[k], this.config) as T
  }

  override async updatePreference(key: string, value: any, global = false): Promise<void> {
    const keys = key.split(".")
    const lastKey = keys.pop()!
    const target = keys.reduce((obj: any, k) => (obj[k] = obj[k] || {}), this.config)
    target[lastKey] = value
  }

  override async loadPreference() {
    if (fs.existsSync(USER_CONFIG_PATH)) {
      const userConfig = JSON.parse(fs.readFileSync(USER_CONFIG_PATH, "utf-8"))
      return preferenceSchema.parse(
        merge(
          {}, // override order: default <-- user (file) <-- env (terminal)
          defaultPreference,
          userConfig,
          envConfig
        )
      )
    }
    return defaultPreference
  }
}
