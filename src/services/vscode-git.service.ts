import * as vscode from "vscode";
import { GitCore } from "@/core/git.core";

export class VscodeGitService {
  private gitCore: GitCore;
  private _onGitStatusChanged: vscode.EventEmitter<boolean>;
  readonly onGitStatusChanged: vscode.Event<boolean>;
  private fsWatcher: vscode.FileSystemWatcher | undefined;

  constructor() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceRoot = workspaceFolders ? workspaceFolders[0].uri.fsPath : "";
    
    this.gitCore = new GitCore(workspaceRoot);
    this._onGitStatusChanged = new vscode.EventEmitter<boolean>();
    this.onGitStatusChanged = this._onGitStatusChanged.event;
    
    this.setupFileSystemWatcher(workspaceRoot);
  }

  private setupFileSystemWatcher(workspaceRoot: string) {
    if (!workspaceRoot) {
      return;
    }

    this.fsWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, ".git/**")
    );

    this.fsWatcher.onDidCreate(async () => {
      const isGit = await this.gitCore.isGitRepository();
      this._onGitStatusChanged.fire(isGit);
    });

    this.fsWatcher.onDidDelete(async () => {
      const isGit = await this.gitCore.isGitRepository();
      this._onGitStatusChanged.fire(isGit);
    });

    this.gitCore.isGitRepository().then((isGit) => {
      this._onGitStatusChanged.fire(isGit);
    });
  }

  public dispose() {
    this.fsWatcher?.dispose();
    this._onGitStatusChanged.dispose();
  }

  // Delegate methods to GitCore
  public async isGitRepository(): Promise<boolean> {
    return this.gitCore.isGitRepository();
  }

  public async getDiff(): Promise<string> {
    return this.gitCore.getDiff();
  }

  public async getUnstagedChanges(): Promise<string> {
    return this.gitCore.getUnstagedChanges();
  }

  public async stageAll(): Promise<void> {
    return this.gitCore.stageAll();
  }

  public async commit(message: string): Promise<void> {
    return this.gitCore.commit(message);
  }

  public async hasChanges(): Promise<boolean> {
    return this.gitCore.hasChanges();
  }

  public async getChangedFiles() {
    return this.gitCore.getChangedFiles();
  }

  public async getLastCommitMessage(): Promise<string> {
    return this.gitCore.getLastCommitMessage();
  }

  public async amendCommit(message: string): Promise<void> {
    await this.gitCore.amendCommit(message);
  }
}
