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
  proxy: process.env["HTTPS_PROXY"] ?? process.env["HTTP_PROXY"],
  apiKeys: {
    anthropic: process.env["ANTHROPIC_API_KEY"],
    openai: process.env["OPENAI_API_KEY"],
    cohere: process.env["COHERE_API_KEY"],
    huggingface: process.env["HUGGINGFACE_API_KEY"],
    google: process.env["GOOGLE_API_KEY"],
    zhipu: process.env["ZHIPU_API_KEY"],
    deepseek: process.env["DEEPSEEK_API_KEY"],
    groq: process.env["GROQ_API_KEY"],
    baichuan: process.env["BAICHUAN_API_KEY"],
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
