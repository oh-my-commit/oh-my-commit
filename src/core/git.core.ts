import simpleGit, { SimpleGit } from "simple-git";
import * as path from "path";
import * as fs from "fs";

export interface CommitChanges {
  files: string[];
  additions: number;
  deletions: number;
  summary: string;
}

export class GitCore {
  protected git: SimpleGit;
  protected workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.git = simpleGit(workspaceRoot);
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
    console.log("[GitCore] Getting diff");
    try {
      const result = await this.git.diff(["--staged"]);
      console.log("[GitCore] Got diff, length:", result?.length || 0);
      return result;
    } catch (error) {
      console.error("[GitCore] Failed to get diff:", error);
      throw error;
    }
  }

  public async getUnstagedChanges(): Promise<string> {
    try {
      return await this.git.diff();
    } catch (error) {
      throw new Error(`Failed to get unstaged changes: ${error}`);
    }
  }

  public async stageAll(): Promise<void> {
    try {
      await this.git.add("-A");
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`);
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

  public async getChangedFiles(): Promise<CommitChanges> {
    try {
      const status = await this.git.status();
      const diffSummary = await this.git.diffSummary(["--staged"]);

      return {
        files: status.staged,
        additions: diffSummary.insertions,
        deletions: diffSummary.deletions,
        summary: diffSummary.files
          .map((file) => {
            if ("insertions" in file && "deletions" in file) {
              return `${file.file} | +${file.insertions} -${file.deletions}`;
            } else if ("insertions" in file) {
              return `${file.file} | +${file.insertions}`;
            } else if ("deletions" in file) {
              return `${file.file} | -${file.deletions}`;
            } else {
              return `${file.file}`;
            }
          })
          .join("\n"),
      };
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error}`);
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
