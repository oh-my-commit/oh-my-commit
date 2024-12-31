/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { z } from "zod"

export const configSchema = z.object({
  basic: z.object({
    enabled: z.boolean().default(true),
    uiLanguage: z.enum(["system", "zh_CN", "en_US"]).default("system"),
  }),
  model: z.object({
    id: z.enum(["ohMyCommit.standard"]).default("ohMyCommit.standard"),
  }),
  git: z.object({
    emptyChangeBehavior: z.enum(["skip", "amend"]).default("skip"),
    autoStage: z.boolean().default(true),
    commitLanguage: z.enum(["system", "zh_CN", "en_US"]).default("system"),
  }),
  ui: z.object({
    mode: z.enum(["silent", "notification", "window", "panel"]).default("window"),
  }),
  proxy: z.object({
    url: z.string().optional(),
    enabled: z.boolean().default(false).optional(),
  }),
  apiKeys: z.object({
    anthropic: z.string().optional(),
    openai: z.string().optional(),
    cohere: z.string().optional(),
    huggingface: z.string().optional(),
    google: z.string().optional(),
    zhipu: z.string().optional(),
    deepseek: z.string().optional(),
    groq: z.string().optional(),
    baichuan: z.string().optional(),
  }),
  telemetry: z.object({
    enabled: z.boolean().default(true),
    shareLevel: z.enum(["minimal", "basic", "full"]).default("basic"),
  }),
  feedback: z.object({
    enabled: z.boolean().default(true),
  }),
})

export type ConfigSchema = z.infer<typeof configSchema>

// 安全地获取环境变量
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key]
  }
  return undefined
}

const proxyUrl = getEnvVar("HTTPS_PROXY") ?? getEnvVar("HTTP_PROXY")
export const envConfig = configSchema.parse({
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

export const defaultConfig: ConfigSchema = {
  basic: {
    enabled: true,
    uiLanguage: "system",
  },
  model: {
    id: "ohMyCommit.standard",
  },
  git: {
    emptyChangeBehavior: "skip",
    autoStage: true,
    commitLanguage: "system",
  },
  ui: {
    mode: "window",
  },
  proxy: {},
  apiKeys: {},
  telemetry: {
    enabled: true,
    shareLevel: "basic",
  },
  feedback: {
    enabled: true,
  },
} as const

export type Config = z.infer<typeof configSchema>
