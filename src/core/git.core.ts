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
  private git: SimpleGit;
  private workspaceRoot: string;

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
    try {
      return await this.git.diff(["--staged"]);
    } catch (error) {
      throw new Error(`Failed to get git diff: ${error}`);
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
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
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
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest?.message || "";
    } catch (error) {
      throw new Error(`Failed to get last commit message: ${error}`);
    }
  }

  public async amendCommit(message: string): Promise<void> {
    try {
      // First reset any staged changes to ensure clean amend
      const status = await this.git.status();
      if (status.staged.length > 0) {
        await this.git.reset();
      }

      // Then amend with the new message
      await this.git.raw(["commit", "--amend", "-m", message, "--no-verify"]);
    } catch (error) {
      throw new Error(`Failed to amend commit: ${error}`);
    }
  }
}
