/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as fs from "fs"
import * as path from "path"
import simpleGit, { type DiffResult, type SimpleGit } from "simple-git"
import { Inject, Service } from "typedi"

import { BaseLogger, TOKENS, formatError } from "../common"

export interface IGitCore {
  git: SimpleGit
  workspaceRoot: string
  getDiffResult(findRenames?: boolean): Promise<DiffResult>
  getDiff(): Promise<string>
  stageAll(): Promise<void>
  isGitRepository(): Promise<boolean>
  commit(message: string): Promise<void>
  hasChanges(): Promise<boolean>
  getLastCommitMessage(): Promise<string>
  amendCommit(message: string): Promise<void>
  getFileDiffDetail(filePath: string): Promise<string>
}

@Service()
export class GitCore implements IGitCore {
  public git: SimpleGit
  public workspaceRoot: string

  constructor(
    workspaceRoot: string,
    @Inject(TOKENS.Logger) protected readonly logger: BaseLogger
  ) {
    this.workspaceRoot = workspaceRoot
    this.git = simpleGit({ baseDir: workspaceRoot })
  }

  /**
   * 获取已暂存文件的统计摘要，用于生成提交信息
   * @param findRenames 是否检测重命名（默认开启）
   */
  public async getDiffResult(findRenames: boolean = true): Promise<DiffResult> {
    const options = ["--staged"]
    if (findRenames) {
      options.push("--name-status")
    }
    return this.git.diffSummary(options)
  }

  public async getDiff(): Promise<string> {
    return this.git.diff(["--staged"])
  }

  /**
   * 暂存所有变更，包括新增、修改和删除的文件
   * 这是 getChanges 的前置操作，确保所有文件都被 git 跟踪
   * @throws 如果暂存操作失败
   */
  public async stageAll(): Promise<void> {
    try {
      await this.git.add("-A")
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`)
    }
  }

  public async isGitRepository(): Promise<boolean> {
    if (!this.workspaceRoot) {
      return false
    }

    const gitDir = path.join(this.workspaceRoot, ".git")
    try {
      const stats = await fs.promises.stat(gitDir)
      return stats.isDirectory()
    } catch (_error) {
      return false
    }
  }

  public async commit(message: string): Promise<void> {
    this.logger.debug("[GitCore] Committing changes")
    try {
      await this.git.commit(message)
      this.logger.debug("[GitCore] Changes committed successfully")
    } catch (error) {
      throw new Error(formatError(error, "Failed to commit changes"))
    }
  }

  public async hasChanges(): Promise<boolean> {
    try {
      const status = await this.git.status()
      return !status.isClean()
    } catch (error) {
      throw new Error(formatError(error, "Failed to check changes"))
    }
  }

  public async getLastCommitMessage(): Promise<string> {
    this.logger.debug("[GitCore] Getting last commit message")
    try {
      const result = await this.git.log(["-1"])
      this.logger.debug("[GitCore] Last commit message:", result.latest?.hash)
      return result.latest?.message || ""
    } catch (error) {
      throw new Error(formatError(error, "Failed to get last commit message"))
    }
  }

  public async amendCommit(message: string): Promise<void> {
    this.logger.debug("[GitCore] Amending last commit")
    try {
      await this.git.commit(message, ["--amend"])
      this.logger.debug("[GitCore] Last commit amended successfully")
    } catch (error) {
      throw new Error(formatError(error, "Failed to amend last commit"))
    }
  }

  /**
   * 获取指定文件的详细 diff 信息
   * @param filePath 相对于仓库根目录的文件路径
   * @returns 文件的 diff 信息，包括修改的行号和内容
   */
  public async getFileDiffDetail(filePath: string): Promise<string> {
    this.logger.debug("[GitCore] Getting file diff detail for:", filePath)
    try {
      // 使用 --unified=0 显示所有上下文，--color 添加颜色标记
      const diff = await this.git.diff([
        "--staged",
        "--unified=0",
        // 颜色相关的在 DiffViewer 中处理，这里不需要，否则会把很多 ascii 字符串送过去
        "--no-color",
        "--",
        filePath,
      ])
      return diff
    } catch (error) {
      throw new Error(formatError(error, "Failed to get file diff detail"))
    }
  }
}
