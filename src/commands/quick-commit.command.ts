import * as vscode from 'vscode';
import { BaseCommand } from './base.command';
import { generateCommitMessage } from '@/utils/generate-commit-message';
import { GitManager } from '@/managers/git.manager';
import { SolutionManager } from '@/managers/solution.manager';

export class QuickCommitCommand extends BaseCommand {
    constructor(gitManager: GitManager, solutionManager: SolutionManager) {
        super('yaac.quickCommit', gitManager, solutionManager);
    }

    async execute(): Promise<void> {
        console.log('Quick commit command triggered');

        if (!(await this.validateGitRepository()) || !(await this.validateSolution())) {
            return;
        }

        if (!(await this.gitManager.hasChanges())) {
            console.log('No changes detected');
            vscode.window.showInformationMessage('No changes to commit');
            return;
        }

        try {
            const commitMessage = await generateCommitMessage(this.gitManager, this.solutionManager);
            console.log(`Generated commit message: ${commitMessage}`);

            const confirmed = await vscode.window.showInputBox({
                prompt: 'Review and edit commit message if needed',
                value: commitMessage,
                validateInput: (value) => value ? null : 'Commit message cannot be empty',
            });

            if (confirmed) {
                console.log('Committing changes...');
                await this.gitManager.stageAll();
                await this.gitManager.commit(confirmed);
                vscode.window.showInformationMessage('Changes committed successfully');
            }
        } catch (error: unknown) {
            console.error('Error during quick commit:', error);
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            vscode.window.showErrorMessage(`Failed to commit: ${message}`);
        }
    }
}
