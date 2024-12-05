import * as vscode from 'vscode';
import { SolutionManager } from '../core/solutionManager';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private solutionManager: SolutionManager) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
    }

    public initialize() {
        this.statusBarItem.command = 'yaac.switchSolution';
        this.update();
        this.statusBarItem.show();
    }

    public async update() {
        const currentSolution = await this.solutionManager.getCurrentSolution();
        if (currentSolution) {
            this.statusBarItem.text = `$(git-commit) ${currentSolution.name}`;
            this.statusBarItem.tooltip = `Current Commit Solution: ${currentSolution.name}\nCost: ${currentSolution.metrics.cost}\nPerformance: ${currentSolution.metrics.performance}\nQuality: ${currentSolution.metrics.quality}\nClick to change`;
        } else {
            this.statusBarItem.text = '$(git-commit) YAAC';
            this.statusBarItem.tooltip = 'Click to select a commit solution';
        }
    }

    public dispose() {
        this.statusBarItem.dispose();
    }
}
