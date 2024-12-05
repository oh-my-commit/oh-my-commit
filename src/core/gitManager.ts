import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitManager {
    constructor(private workspaceRoot: string) {}

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
