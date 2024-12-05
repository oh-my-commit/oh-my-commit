import * as vscode from 'vscode';
import { SolutionManager } from '../core/solutionManager';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private solutionManager: SolutionManager) {
        console.log('Initializing StatusBarManager');
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.name = 'YAAC';
    }

    public initialize() {
        console.log('Setting up status bar item');
        this.statusBarItem.command = 'yaac.switchSolution';
        this.update();
        this.statusBarItem.show();
        console.log('Status bar item is now visible');
    }

    public async update() {
        try {
            console.log('Updating status bar');
            const currentSolution = await this.solutionManager.getCurrentSolution();
            if (currentSolution) {
                console.log(`Current solution: ${currentSolution.name}`);
                this.statusBarItem.text = `$(git-commit) YAAC: ${currentSolution.name}`;
                this.statusBarItem.tooltip = 
                    `Current Commit Solution: ${currentSolution.name}\n` +
                    `Cost: ${currentSolution.metrics.cost}\n` +
                    `Performance: ${currentSolution.metrics.performance}\n` +
                    `Quality: ${currentSolution.metrics.quality}\n` +
                    `Click to change`;
            } else {
                console.log('No current solution selected');
                this.statusBarItem.text = '$(git-commit) YAAC';
                this.statusBarItem.tooltip = 'Click to select a commit solution';
            }
            // 确保状态栏项目可见
            this.statusBarItem.show();
        } catch (error) {
            console.error('Error updating status bar:', error);
            this.statusBarItem.text = '$(warning) YAAC';
            this.statusBarItem.tooltip = 'Error updating status bar. Click to retry.';
            this.statusBarItem.show();
        }
    }

    public dispose() {
        console.log('Disposing status bar item');
        this.statusBarItem.dispose();
    }
}
