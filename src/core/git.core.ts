import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

export interface CommitChanges {
  files: string[];
  additions: number;
  deletions: number;
  summary: string;
}

export class GitCore {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
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

  public async getDiff(): Promise<string> {
    try {
      const { stdout } = await execAsync("git diff --staged", {
        cwd: this.workspaceRoot,
      });
      return stdout;
    } catch (error) {
      throw new Error(`Failed to get git diff: ${error}`);
    }
  }

  public async getUnstagedChanges(): Promise<string> {
    try {
      const { stdout } = await execAsync("git diff", {
        cwd: this.workspaceRoot,
      });
      return stdout;
    } catch (error) {
      throw new Error(`Failed to get unstaged changes: ${error}`);
    }
  }

  public async stageAll(): Promise<void> {
    try {
      await execAsync("git add -A", { cwd: this.workspaceRoot });
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`);
    }
  }

  public async commit(message: string): Promise<void> {
    try {
      await execAsync(`git commit -m "${message}"`, {
        cwd: this.workspaceRoot,
      });
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  public async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        "git status --porcelain",
        { cwd: this.workspaceRoot }
      );
      return stdout.length > 0;
    } catch (error) {
      throw new Error(`Failed to check changes: ${error}`);
    }
  }

  public async getChangedFiles(): Promise<CommitChanges> {
    try {
      const { stdout: diffStats } = await execAsync(
        "git diff --staged --numstat",
        { cwd: this.workspaceRoot }
      );

      const files: string[] = [];
      let additions = 0;
      let deletions = 0;

      diffStats.split("\n").forEach((line) => {
        if (!line) return;
        const [add, del, file] = line.split("\t");
        if (file) {
          files.push(file);
          additions += parseInt(add) || 0;
          deletions += parseInt(del) || 0;
        }
      });

      const { stdout: summary } = await execAsync(
        "git diff --staged --compact-summary",
        { cwd: this.workspaceRoot }
      );

      return {
        files,
        additions,
        deletions,
        summary: summary.trim(),
      };
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error}`);
    }
  }
}
