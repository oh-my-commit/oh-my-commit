/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { z } from "zod"

export const preferenceSchema = z.object({
  log: z.object({
    level: z.enum(["debug", "info", "warn", "error"]).default("info").optional(),
  }),
  basic: z.object({
    enabled: z.boolean().default(true),
    uiLanguage: z.enum(["system", "zh_CN", "en_US"]).default("system"),
  }),
  model: z.object({
    id: z.string().default("omc-standard-claude-3.5"),
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

export type PreferenceSchema = z.infer<typeof preferenceSchema>

export const defaultPreference: PreferenceSchema = {
  log: {},
  basic: {
    enabled: true,
    uiLanguage: "system",
  },
  model: {
    id: "omc-standard-claude-3.5",
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

export type Preference = z.infer<typeof preferenceSchema>
