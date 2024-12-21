import type { ResultAsync } from "neverthrow"
import type { DiffResult } from "simple-git"
import { Inject, Service } from "typedi"
import { z } from "zod"
import { APP_NAME, SETTING_MODEL_ID } from "./app"
import { TOKENS, type IConfig, type ILogger, type IProviderManager } from "./core"
import { ConsoleLogger, type BaseLogger } from "./log"
import { formatError, formatMessage, type ResultDTO } from "./utils"

export type Status = "pending" | "running" | "success" | "error"

@Service()
export class CommitManager {
  public providers: BaseGenerateCommitProvider[] = []
  public status: {
    loadingProviders: Status
  } = {
    loadingProviders: "pending",
  }
  private static initPromise: Promise<void> | null = null

  constructor(
    @Inject(TOKENS.Config) public readonly config: IConfig,
    @Inject(TOKENS.Logger) public readonly logger: ILogger,
    @Inject(TOKENS.ProviderManager) private readonly providersManager: IProviderManager,
  ) {}

  get models() {
    return this.providers.flatMap(provider => provider.models)
  }

  /**
   * 线程安全的初始化方法
   */
  public async initProviders() {
    if (!CommitManager.initPromise) {
      CommitManager.initPromise = this.doInitProviders()
    }
    try {
      await CommitManager.initPromise
    } catch (error) {
      // Reset initPromise so we can try again
      CommitManager.initPromise = null
      throw error
    }
  }

  private async doInitProviders() {
    this.status.loadingProviders = "running"
    try {
      this.providers = await this.providersManager.init()
      this.logger.info(`Loaded ${this.providers.length} providers`)
      this.status.loadingProviders = "success"
    } catch (error) {
      this.logger.error(`Failed to load providers: ${formatError(error)}`)
      this.status.loadingProviders = "error"
      throw error // Re-throw to propagate the error
    }
  }

  async generateCommit(diff: DiffResult, options?: GenerateCommitOptions) {
    // Initialize providers if not already done
    await this.initProviders()

    // Get selected model from config
    const modelId = this.config.get<string>(SETTING_MODEL_ID) ?? this.providers[0]?.models[0]?.id
    if (!modelId) {
      throw new Error("No model available")
    }

    const provider = this.providers.find(p => p.models.some(model => model.id === modelId))
    if (!provider) {
      throw new Error(`No provider found for model ${modelId}`)
    }

    const generateOptions = options || {
      lang: this.config.get("lang"),
    }

    return provider.generateCommit({ model: modelId, diff, options: generateOptions })
  }
}

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

export const GenerateCommitInputSchema = z.object({
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
    .args(GenerateCommitInputSchema)
    .returns(z.any())
    .describe("生成提交信息的核心方法"), // ResultAsync 类型较复杂，这里简化处理
})

export type IModel = z.infer<typeof ModelSchema>
export type IProvider = z.infer<typeof ProviderSchema>
export type GenerateCommitInput = z.infer<typeof GenerateCommitInputSchema>

export abstract class BaseGenerateCommitProvider implements IProvider {
  /**
   * 可继承或重载的 logger
   */
  public logger: BaseLogger = new ConsoleLogger(APP_NAME)

  /**
   * 供应商 ID
   */
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
  abstract generateCommit(
    input: GenerateCommitInput,
  ): ResultAsync<GenerateCommitResult, GenerateCommitError>

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
}

/**
 * 其他用户配置
 */
export interface GenerateCommitOptions {
  /**
   * 用户希望生成 commit 的语言
   */
  lang?: string
}

export interface GenerateCommitCoreInput {
  /**
   * 用户提交的 Diff 信息
   */
  diff: DiffResult

  options?: GenerateCommitOptions
}

/**
 * AI Commit 的核心生成数据
 */
export interface GenerateCommitResult {
  title: string
  body?: string
  meta?: Record<string, any>
}

/**
 * 供应商返回的错误
 */
export class GenerateCommitError extends Error {
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

/**
 * 供应商如果需要 Restful 接口的推荐 DTO
 */
export type GenerateCommitDTO = ResultDTO<GenerateCommitResult>

/**
 * Git 文件变更类型
 */
export enum GitChangeType {
  Added = "added", // A: 新增的文件
  Modified = "modified", // M: 修改的文件
  Deleted = "deleted", // D: 删除的文件
  Renamed = "renamed", // R: 重命名的文件
  Copied = "copied", // C: 复制的文件
  Unmerged = "unmerged", // U: 未合并的文件
  Unknown = "unknown", // ?: 未知状态
}

/**
 * Git 文件变更信息
 */
export interface GitFileChange {
  /** 显示名称 */
  displayName?: string
  /** 文件路径 */
  path: string
  /** 文件原始路径(重命名时使用) */
  oldPath?: string
  /** 文件状态 */
  status: GitChangeType
  /** 文件差异 */
  diff?: string
  /** 增加的行数 */
  additions: number
  /** 删除的行数 */
  deletions: number
  /** 文件内容 */
  content?: string
  /** 文件原始内容 */
  oldContent?: string
}

export interface TreeNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: TreeNode[]
  size?: number
  displayName?: string
  fileInfo?: {
    path: string
    size: number
    type: string
    modified: string
    additions?: number
    deletions?: number
    status?: string
  }
  stats?: {
    totalFiles: number
    totalDirectories: number
    totalSize: number
  }
}

export const presetAiProviders = ["openai", "anthropic", "deepseek", "zhipu", "groq"]
/**
 * 提交消息验证规则
 */
export const COMMIT_MESSAGE_RULES = {
  minLength: 10,
  maxLength: 72,
  pattern: /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/,
}

/**
 * 验证提交消息
 */
export function validateCommitMessage(message: string) {
  if (message.length < COMMIT_MESSAGE_RULES.minLength) {
    return {
      valid: false,
      error: `提交消息至少需要 ${COMMIT_MESSAGE_RULES.minLength} 个字符`,
    }
  }

  if (message.length > COMMIT_MESSAGE_RULES.maxLength) {
    return {
      valid: false,
      error: `提交消息不能超过 ${COMMIT_MESSAGE_RULES.maxLength} 个字符`,
    }
  }

  if (!COMMIT_MESSAGE_RULES.pattern.test(message)) {
    return {
      valid: false,
      error: "提交消息格式不正确，应该遵循 Conventional Commits 规范",
    }
  }

  return { valid: true }
}
