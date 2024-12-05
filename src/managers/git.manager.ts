import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

export class GitManager {
  private workspaceRoot: string;
  private _onGitStatusChanged: vscode.EventEmitter<boolean> =
    new vscode.EventEmitter<boolean>();
  readonly onGitStatusChanged: vscode.Event<boolean> =
    this._onGitStatusChanged.event;
  private fsWatcher: vscode.FileSystemWatcher | undefined;

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      this.workspaceRoot = "";
    } else {
      this.workspaceRoot = workspaceFolders[0].uri.fsPath;
    }
    this.setupFileSystemWatcher();
  }

  private setupFileSystemWatcher() {
    if (!this.workspaceRoot) {
      return;
    }

    // 监听 .git 目录的创建和删除
    this.fsWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.workspaceRoot, ".git/**")
    );

    this.fsWatcher.onDidCreate(async () => {
      const isGit = await this.isGitRepository();
      this._onGitStatusChanged.fire(isGit);
    });

    this.fsWatcher.onDidDelete(async () => {
      const isGit = await this.isGitRepository();
      this._onGitStatusChanged.fire(isGit);
    });

    // 初始检查
    this.isGitRepository().then((isGit) => {
      this._onGitStatusChanged.fire(isGit);
    });
  }

  public dispose() {
    this.fsWatcher?.dispose();
    this._onGitStatusChanged.dispose();
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
      await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: this.workspaceRoot,
      });
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  public async hasChanges(): Promise<boolean> {
    try {
      const { stdout: status } = await execAsync("git status --porcelain", {
        cwd: this.workspaceRoot,
      });
      return status.length > 0;
    } catch (error) {
      throw new Error(`Failed to check git status: ${error}`);
    }
  }

  public async getChanges(): Promise<CommitChanges> {
    if (!this.workspaceRoot) {
      throw new Error("No workspace root found");
    }

    try {
      // Get status of files
      const { stdout: statusOutput } = await execAsync(
        "git status --porcelain",
        { cwd: this.workspaceRoot }
      );
      const files = statusOutput
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => {
          const file = line.substring(3);
          return vscode.Uri.file(path.join(this.workspaceRoot, file));
        });

      // Get diff stats
      const { stdout: diffOutput } = await execAsync("git diff --numstat", {
        cwd: this.workspaceRoot,
      });
      let additions = 0;
      let deletions = 0;

      diffOutput
        .trim()
        .split("\n")
        .forEach((line) => {
          if (line.trim()) {
            const [add, del] = line.split("\t").map((n) => parseInt(n) || 0);
            additions += add;
            deletions += del;
          }
        });

      return {
        files,
        additions,
        deletions,
        summary: `Changed ${files.length} files (+${additions}, -${deletions})`,
      };
    } catch (error) {
      console.error("Error getting git changes:", error);
      throw error;
    }
  }
}

interface CommitChanges {
  files: vscode.Uri[];
  additions: number;
  deletions: number;
  summary: string;
}
