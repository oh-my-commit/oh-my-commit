import type { ResultAsync } from "neverthrow"
import type { DiffResult } from "simple-git"
import { APP_NAME } from "./app"
import { type BaseLogger, ConsoleLogger } from "./log"
import { formatMessage, type ResultDTO } from "./utils"

/**
 * 供应商定义的模型 meta 信息，供用户候选
 */
export interface Model {
  providerId: string
  id: string
  name: string
  description: string

  /**
   * 一些供用户明确准确度、性能、成本的指标
   */
  metrics?: {
    accuracy: number
    speed: number
    cost: number
  }
}

export abstract class BaseGenerateCommitProvider {
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
  abstract models: Model[]

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

export interface GenerateCommitInput extends GenerateCommitCoreInput {
  /**
   * 用户选用的供应商模型
   */
  model: Model
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
