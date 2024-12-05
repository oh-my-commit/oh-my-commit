import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class GitManager {
    private workspaceRoot: string;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            this.workspaceRoot = '';
        } else {
            this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        }
    }

    public async isGitRepository(): Promise<boolean> {
        if (!this.workspaceRoot) {
            return false;
        }

        const gitDir = path.join(this.workspaceRoot, '.git');
        try {
            const stats = await fs.promises.stat(gitDir);
            return stats.isDirectory();
        } catch (error) {
            return false;
        }
    }

    public async getDiff(): Promise<string> {
        try {
            const { stdout } = await execAsync('git diff --staged', { cwd: this.workspaceRoot });
            return stdout;
        } catch (error) {
            throw new Error(`Failed to get git diff: ${error}`);
        }
    }

    public async getUnstagedChanges(): Promise<string> {
        try {
            const { stdout } = await execAsync('git diff', { cwd: this.workspaceRoot });
            return stdout;
        } catch (error) {
            throw new Error(`Failed to get unstaged changes: ${error}`);
        }
    }

    public async stageAll(): Promise<void> {
        try {
            await execAsync('git add -A', { cwd: this.workspaceRoot });
        } catch (error) {
            throw new Error(`Failed to stage changes: ${error}`);
        }
    }

    public async commit(message: string): Promise<void> {
        try {
            await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: this.workspaceRoot });
            vscode.window.showInformationMessage('Successfully committed changes!');
        } catch (error) {
            throw new Error(`Failed to commit: ${error}`);
        }
    }

    public async hasChanges(): Promise<boolean> {
        try {
            const { stdout: status } = await execAsync('git status --porcelain', { cwd: this.workspaceRoot });
            return status.length > 0;
        } catch (error) {
            throw new Error(`Failed to check git status: ${error}`);
        }
    }
}
