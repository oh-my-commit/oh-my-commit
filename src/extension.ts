import * as vscode from 'vscode';
import { StatusBarManager } from './ui/statusBar';
import { SolutionManager } from './core/solutionManager';
import { ConfigManager } from './core/configManager';
import { GitManager } from './core/gitManager';

export async function activate(context: vscode.ExtensionContext) {
    // 确保在工作区中
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('YAAC needs to be run in a workspace with a git repository');
        return;
    }

    // 初始化核心管理器
    const configManager = new ConfigManager(context);
    const solutionManager = new SolutionManager(configManager);
    const statusBar = new StatusBarManager(solutionManager);
    const gitManager = new GitManager(workspaceRoot);

    // 注册命令
    let disposables = [
        vscode.commands.registerCommand('yaac.quickCommit', async () => {
            try {
                // 检查是否有更改
                if (!await gitManager.hasChanges()) {
                    vscode.window.showInformationMessage('No changes to commit');
                    return;
                }

                // 获取当前方案
                const solution = await solutionManager.getCurrentSolution();
                if (!solution) {
                    vscode.window.showErrorMessage('No commit solution selected');
                    return;
                }

                // 暂时使用模拟的提交消息生成
                const commitMessage = await generateCommitMessage(solution.id);
                
                // 确认提交消息
                const confirmed = await vscode.window.showInputBox({
                    prompt: 'Review and edit commit message if needed',
                    value: commitMessage,
                    validateInput: value => value ? null : 'Commit message cannot be empty'
                });

                if (confirmed) {
                    // 自动暂存所有更改
                    await gitManager.stageAll();
                    // 提交更改
                    await gitManager.commit(confirmed);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to commit: ${error}`);
            }
        }),

        vscode.commands.registerCommand('yaac.switchSolution', async () => {
            const solutions = await solutionManager.getAvailableSolutions();
            const selected = await vscode.window.showQuickPick(
                solutions.map(s => ({
                    label: s.name,
                    description: `Cost: ${s.metrics.cost}, Performance: ${s.metrics.performance}, Quality: ${s.metrics.quality}`,
                    solution: s
                }))
            );

            if (selected) {
                await solutionManager.switchSolution(selected.solution.id);
                statusBar.update();
                vscode.window.showInformationMessage(`Switched to ${selected.solution.name}`);
            }
        }),

        vscode.commands.registerCommand('yaac.configureApi', async () => {
            // 实现 API 配置逻辑
        }),

        vscode.commands.registerCommand('yaac.manageSolutions', async () => {
            // 实现方案管理逻辑
        })
    ];

    context.subscriptions.push(...disposables);
    
    // 初始化状态栏
    statusBar.initialize();
}

// 临时的提交消息生成函数
async function generateCommitMessage(solutionId: string): Promise<string> {
    // 这里暂时返回一个模拟的提交消息，后续会替换为真实的实现
    const messages = {
        'official_recommend': 'feat: implement core functionality',
        'gcop_fast': 'update: quick changes',
        'premium_quality': 'feat(core): implement comprehensive solution with detailed documentation'
    };
    return messages[solutionId as keyof typeof messages] || 'chore: update code';
}

export function deactivate() {
    // 清理资源
}
