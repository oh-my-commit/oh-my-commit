/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
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
  proxy: z.string().optional(),
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

// 安全地获取环境变量
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key]
  }
  return undefined
}

export const defaultConfig = {
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
  proxy: getEnvVar("HTTPS_PROXY") ?? getEnvVar("HTTP_PROXY"),
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
    enabled: true,
    shareLevel: "basic",
  },
  feedback: {
    enabled: true,
  },
} as const

export type Config = z.infer<typeof configSchema>
