import * as fs from "fs"
import * as path from "path"
import simpleGit, { type DiffResult, type SimpleGit } from "simple-git"

export class GitCore {
  protected git: SimpleGit
  protected workspaceRoot: string

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot
    this.git = simpleGit(workspaceRoot)
  }

  /**
   * 获取已暂存文件的统计摘要，用于生成提交信息
   */
  public async getDiffResult(): Promise<DiffResult> {
    return this.git.diffSummary("--staged")
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
    console.log("[GitCore] Committing changes")
    try {
      await this.git.commit(message)
      console.log("[GitCore] Changes committed successfully")
    } catch (error) {
      console.error("[GitCore] Failed to commit changes:", error)
      throw error
    }
  }

  public async hasChanges(): Promise<boolean> {
    try {
      const status = await this.git.status()
      return !status.isClean()
    } catch (error) {
      throw new Error(`Failed to check changes: ${error}`)
    }
  }

  public async getLastCommitMessage(): Promise<string> {
    console.log("[GitCore] Getting last commit message")
    try {
      const result = await this.git.log(["-1"])
      console.log("[GitCore] Last commit message:", result.latest?.hash)
      return result.latest?.message || ""
    } catch (error) {
      console.error("[GitCore] Failed to get last commit message:", error)
      return ""
    }
  }

  public async amendCommit(message: string): Promise<void> {
    console.log("[GitCore] Amending last commit")
    try {
      await this.git.commit(message, ["--amend"])
      console.log("[GitCore] Last commit amended successfully")
    } catch (error) {
      console.error("[GitCore] Failed to amend last commit:", error)
      throw error
    }
  }
}
