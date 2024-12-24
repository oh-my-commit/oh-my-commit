import { z } from "zod"
import type { IConfig } from "./core"
import type { BaseLogger } from "./log"
import { formatMessage } from "./utils"

export type Status = "pending" | "running" | "success" | "error"

/**
 * 供应商定义的模型 meta 信息，供用户候选
 */
export const ModelSchema = z.object({
  /** 供应商唯一标识符，用于区分不同的供应商 */
  providerId: z.string().describe("供应商唯一标识符，用于区分不同的供应商"),

  /** 模型唯一标识符，在同一供应商下必须唯一 */
  id: z.string().describe("模型唯一标识符，在同一供应商下必须唯一"),

  /** 模型显示名称，用于在 UI 中展示 */
  name: z.string().describe("模型显示名称，用于在 UI 中展示"),

  /** 模型详细描述，说明模型的特点和适用场景 */
  description: z.string().describe("模型详细描述，说明模型的特点和适用场景"),

  /** 模型性能指标，用于评估模型的各项能力 */
  metrics: z
    .object({
      /** 准确度评分 (0-1)，越高表示生成的提交信息越准确 */
      accuracy: z.number().min(0).max(1).describe("准确度评分 (0-1)，越高表示生成的提交信息越准确"),

      /** 速度评分 (0-1)，越高表示生成速度越快 */
      speed: z.number().min(0).max(1).describe("速度评分 (0-1)，越高表示生成速度越快"),

      /** 成本评分 (0-1)，越高表示使用成本越高 */
      cost: z.number().min(0).max(1).describe("成本评分 (0-1)，越高表示使用成本越高"),
    })
    .describe("模型性能指标，用于评估模型的各项能力")
    .optional(),
})

export const InputSchema = z.object({
  /** 选择的模型信息 */
  model: z.string().describe("选择的模型"),

  /** Git diff 信息，包含文件变更的详细内容 */
  diff: z.any().describe("Git diff 信息，包含文件变更的详细内容"), // DiffResult 类型较复杂，这里简化处理

  /** 生成选项配置 */
  options: z
    .object({
      /** 期望生成的提交信息语言，例如 'en' 或 'zh' */
      lang: z.string().optional().describe("期望生成的提交信息语言，例如 'en' 或 'zh'"),
    })
    .describe("生成选项配置")
    .optional(),
})

export const ProviderSchema = z.object({
  /** 供应商唯一标识符 */
  id: z.string().describe("供应商唯一标识符"),

  /** 供应商显示名称，用于在 UI 中展示 */
  displayName: z.string().describe("供应商显示名称，用于在 UI 中展示"),

  /** 供应商详细描述，说明支持的功能和特点 */
  description: z.string().describe("供应商详细描述，说明支持的功能和特点"),

  /** 供应商提供的模型列表 */
  models: z.array(ModelSchema).describe("供应商提供的模型列表"),

  /** 生成提交信息的核心方法 */
  generateCommit: z
    .function()
    .args(InputSchema)
    .returns(z.any())
    .describe("生成提交信息的核心方法"), // ResultAsync 类型较复杂，这里简化处理
})

export const ResultSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  meta: z.record(z.any()).optional(),
})

export const ResultDTOSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: ResultSchema,
  }),
  z.object({
    ok: z.literal(false),
    code: z.number(),
    message: z.string(),
  }),
])

/**
 * 其他用户配置
 */
export interface IInputOptions {
  /**
   * 用户希望生成 commit 的语言
   */
  lang?: string
}

/**
 * 供应商返回的错误
 */
export class IError extends Error {
  public readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = "GenerateCommitError"
  }

  toJSON() {
    return {
      code: this.code,
      name: this.name,
      message: formatMessage(this.message),
    }
  }
}

export type IModel = z.infer<typeof ModelSchema>
export type IProvider = z.infer<typeof ProviderSchema>
export type IInput = z.infer<typeof InputSchema>
export type IResult = z.infer<typeof ResultSchema>
export type IResultDTO = z.infer<typeof ResultDTOSchema>

export interface ProviderContext {
  logger: BaseLogger
  config: IConfig
}

export abstract class BaseProvider implements IProvider {
  protected context: ProviderContext

  constructor(context: ProviderContext) {
    this.context = context
  }

  abstract id: string

  /**
   * 供应商名称
   */
  abstract displayName: string

  /**
   * 供应商描述
   */
  abstract description: string

  /**
   * 供应商模型列表，具体调用要在 .generateCommit 里 switch 实现
   */
  abstract models: IModel[]

  /**
   * 核心调用
   * .param input
   */
  abstract generateCommit(input: IInput): Promise<IResultDTO>

  /**
   * 标准化 provider 的输出，并避免供应商调试时打印一些自循环的属性导致报错
   * .returns
   */
  toJSON() {
    return {
      id: this.id,
      displayName: this.displayName,
      description: this.description,
      models: this.models.map(m => m.id),
    }
  }

  get logger() {
    return this.context.logger
  }

  get config() {
    return this.context.config
  }
}
