import * as fs from "fs";
import * as path from "path";
import simpleGit, { SimpleGit, DiffResult } from "simple-git";
import {
  GitChangeSummary,
  GitFileChange,
  GitChangeType,
} from "@oh-my-commits/shared";

export class GitCore {
  protected git: SimpleGit;
  protected workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.git = simpleGit(workspaceRoot);
  }

  /**
   * 获取已暂存文件的统计摘要，用于生成提交信息
   */
  public async getDiffSummary(): Promise<DiffResult> {
    return this.git.diffSummary("--staged");
  }

  /**
   * 获取已暂存文件的详细信息，用于文件差异展示
   */
  public async getChangeSummary(): Promise<GitChangeSummary> {
    // todo: think this later
    await this.stageAll();

    const diff = await this.git.diffSummary("--staged");
    const files: GitFileChange[] = [];

    // 获取每个文件的详细信息
    for (const file of diff.files) {
      const fileDiff = await this.git.diff(["--staged", "--", file.file]);
      // @ts-expect-error 未来可以支持 content
      const content = await this.getFileContent(file.file);

      // 使用类型断言来处理 insertions 和 deletions
      const insertions = (file as any).insertions || 0;
      const deletions = (file as any).deletions || 0;

      files.push({
        path: file.file,
        status: await this.getChangeType(file),
        diff: fileDiff,
        // content,
        additions: insertions,
        deletions: deletions,
      });
    }

    return {
      files,
      changed: diff.changed,
      insertions: diff.insertions,
      deletions: diff.deletions,
    };
  }

  /**
   * 获取文件当前内容
   */
  private async getFileContent(filePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.workspaceRoot, filePath);
      return await fs.promises.readFile(fullPath, "utf-8");
    } catch (error) {
      return ""; // 文件可能已被删除
    }
  }

  /**
   * 判断文件变更类型
   * @param file 文件信息
   * @returns GitChangeType 文件变更类型
   */
  private async getChangeType(
    file: DiffResult["files"][0]
  ): Promise<GitChangeType> {
    const status = await this.git.status();
    const fileStatus = status.files.find((f) => f.path === file.file);

    if (!fileStatus) {
      return GitChangeType.Unknown;
    }

    // 组合 index 和 working_dir 状态
    const indexState = fileStatus.index;
    const workingState = fileStatus.working_dir;

    // 处理重命名和复制的情况
    if (indexState === "R") return GitChangeType.Renamed;
    if (indexState === "C") return GitChangeType.Copied;

    // 处理未合并的冲突
    if (indexState === "U" || workingState === "U") {
      return GitChangeType.Unmerged;
    }

    // 处理基本状态
    if (indexState === "A" || workingState === "A") return GitChangeType.Added;
    if (indexState === "D" || workingState === "D")
      return GitChangeType.Deleted;
    if (indexState === "M" || workingState === "M")
      return GitChangeType.Modified;

    return GitChangeType.Unknown;
  }
  /**
   * 暂存所有变更，包括新增、修改和删除的文件
   * 这是 getChanges 的前置操作，确保所有文件都被 git 跟踪
   * @throws 如果暂存操作失败
   */
  public async stageAll(): Promise<void> {
    try {
      await this.git.add("-A");
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`);
    }
  }

  public async isGitRepository(): Promise<boolean> {
    if (!this.workspaceRoot) {
      return false;
    }

    const gitDir = path.join(this.workspaceRoot, ".git");
    try {
      const stats = await fs.promises.stat(gitDir);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  public async commit(message: string): Promise<void> {
    console.log("[GitCore] Committing changes");
    try {
      await this.git.commit(message);
      console.log("[GitCore] Changes committed successfully");
    } catch (error) {
      console.error("[GitCore] Failed to commit changes:", error);
      throw error;
    }
  }

  public async hasChanges(): Promise<boolean> {
    try {
      const status = await this.git.status();
      return !status.isClean();
    } catch (error) {
      throw new Error(`Failed to check changes: ${error}`);
    }
  }

  public async getLastCommitMessage(): Promise<string> {
    console.log("[GitCore] Getting last commit message");
    try {
      const result = await this.git.log(["-1"]);
      console.log("[GitCore] Last commit message:", result.latest?.hash);
      return result.latest?.message || "";
    } catch (error) {
      console.error("[GitCore] Failed to get last commit message:", error);
      return "";
    }
  }

  public async amendCommit(message: string): Promise<void> {
    console.log("[GitCore] Amending last commit");
    try {
      await this.git.commit(message, ["--amend"]);
      console.log("[GitCore] Last commit amended successfully");
    } catch (error) {
      console.error("[GitCore] Failed to amend last commit:", error);
      throw error;
    }
  }
}
