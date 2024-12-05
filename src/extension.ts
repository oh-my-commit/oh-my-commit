import * as vscode from 'vscode';
import { StatusBarManager } from './ui/statusBar';
import { SolutionManager } from './core/solutionManager';
import { ConfigManager } from './core/configManager';
import { GitManager } from './core/gitManager';
import { ServiceFactory } from './core/services/serviceFactory';
import { SUPPORTED_MODELS } from './core/services/providers/gcop';

export async function activate(context: vscode.ExtensionContext) {
    // 添加激活日志
    console.log('YAAC is now active!');

    // 确保在工作区中
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        console.log('No workspace found');
        vscode.window.showErrorMessage('YAAC needs to be run in a workspace with a git repository');
        return;
    }
    console.log(`Workspace root: ${workspaceRoot}`);

    // 初始化核心管理器
    const configManager = new ConfigManager(context);
    const solutionManager = new SolutionManager(configManager);
    const statusBar = new StatusBarManager(solutionManager);
    const gitManager = new GitManager();

    console.log('Core managers initialized');

    // 监听 Git 状态变化
    gitManager.onGitStatusChanged(async isGit => {
        console.log(`Git status changed: ${isGit ? 'initialized' : 'removed'}`);
        if (isGit) {
            statusBar.show();
            vscode.commands.executeCommand('setContext', 'yaac.isGitRepository', true);
        } else {
            statusBar.hide();
            vscode.commands.executeCommand('setContext', 'yaac.isGitRepository', false);
        }
    });

    // 注册命令
    let disposables = [
        vscode.commands.registerCommand('yaac.quickCommit', async () => {
            console.log('Quick commit command triggered');
            try {
                // 检查是否是 Git 仓库
                if (!await gitManager.isGitRepository()) {
                    console.log('Not a git repository');
                    vscode.window.showErrorMessage('This workspace is not a git repository');
                    return;
                }

                // 检查是否有更改
                if (!await gitManager.hasChanges()) {
                    console.log('No changes detected');
                    vscode.window.showInformationMessage('No changes to commit');
                    return;
                }

                // 获取当前方案
                const solution = await solutionManager.getCurrentSolution();
                if (!solution) {
                    console.log('No solution selected');
                    vscode.window.showErrorMessage('No commit solution selected');
                    return;
                }
                console.log(`Using solution: ${solution.name}`);

                // 生成提交消息
                const commitMessage = await generateCommitMessage(solution.id);
                console.log(`Generated commit message: ${commitMessage}`);
                
                // 确认提交消息
                const confirmed = await vscode.window.showInputBox({
                    prompt: 'Review and edit commit message if needed',
                    value: commitMessage,
                    validateInput: value => value ? null : 'Commit message cannot be empty'
                });

                if (confirmed) {
                    console.log('Committing changes...');
                    // 自动暂存所有更改
                    await gitManager.stageAll();
                    // 提交更改
                    await gitManager.commit(confirmed);
                    console.log('Changes committed successfully');
                } else {
                    console.log('Commit cancelled by user');
                }
            } catch (error) {
                console.error('Commit failed:', error);
                vscode.window.showErrorMessage(`Failed to commit: ${error}`);
            }
        }),

        vscode.commands.registerCommand('yaac.switchSolution', async () => {
            console.log('Switch solution command triggered');
            const factory = ServiceFactory.getInstance();
            const services = factory.getAllServices();
            
            const items = services.map(service => ({
                label: service.name,
                description: service.description,
                detail: `Speed: ${service.metrics.speed}/5 | Cost: ${service.metrics.cost}/5 | Quality: ${service.metrics.quality}/5`,
                service
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: '选择 AI 提交助手',
                matchOnDescription: true,
                matchOnDetail: true
            });

            if (selected) {
                await solutionManager.setCurrentSolution({
                    id: selected.service.name.toLowerCase(),
                    name: selected.service.name,
                    provider: 'gcop',
                    description: selected.service.description,
                    metrics: {
                        cost: 5,
                        performance: 8,
                        quality: 8
                    }
                });
                console.log(`Switched to solution: ${selected.service.name}`);
                vscode.window.showInformationMessage(`已切换到 ${selected.service.name}`);
            }
        }),

        vscode.commands.registerCommand('yaac.configureApi', async () => {
            console.log('Configure API command triggered');
            const config = vscode.workspace.getConfiguration('yaac.gcop');
            const currentModel = config.get<string>('model') || 'openai/gpt-4';
            const provider = currentModel.split('/')[0];

            // 打开设置
            await vscode.commands.executeCommand('workbench.action.openSettings', `@ext:cs-magic.yaac gcop`);
            
            // 提示设置环境变量
            const envVarName = `${provider.toUpperCase()}_API_KEY`;
            vscode.window.showInformationMessage(
                `请确保已设置 ${envVarName} 环境变量`,
                '了解更多'
            ).then(selection => {
                if (selection === '了解更多') {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/cs-magic/yaac#configuration'));
                }
            });
        }),

        vscode.commands.registerCommand('yaac.manageSolutions', async () => {
            console.log('Manage solutions command triggered');
            const config = vscode.workspace.getConfiguration('yaac.gcop');
            
            const items = Object.entries(SUPPORTED_MODELS).map(([id, info]) => ({
                label: info.displayName,
                description: info.description,
                detail: `速度: ${info.metrics.speed}/5 | 成本: ${info.metrics.cost}/5 | 质量: ${info.metrics.quality}/5`,
                id
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: '选择要使用的 AI 模型',
                matchOnDescription: true,
                matchOnDetail: true
            });

            if (selected) {
                await config.update('model', selected.id, true);
                console.log(`Updated model to: ${selected.id}`);
                
                // 重新初始化服务
                ServiceFactory.getInstance().registerDefaultServices();
                vscode.window.showInformationMessage(`已切换到 ${selected.label}`);
            }
        })
    ];

    context.subscriptions.push(...disposables);
    console.log('Commands registered');

    // 初始检查 Git 状态
    const isGit = await gitManager.isGitRepository();
    if (isGit) {
        statusBar.show();
        vscode.commands.executeCommand('setContext', 'yaac.isGitRepository', true);
    }
}

// 生成提交消息
async function generateCommitMessage(solutionId: string): Promise<string> {
    try {
        const service = ServiceFactory.getInstance().getService(solutionId);
        if (!service) {
            throw new Error('No commit service available');
        }

        const gitManager = new GitManager();
        const changes = await gitManager.getChanges();
        const message = await service.generateCommitMessage(changes);
        
        return `${message.type}: ${message.subject}\n\n${message.body}`;
    } catch (error) {
        console.error('Failed to generate commit message:', error);
        throw error;
    }
}

export function deactivate() {
    console.log('YAAC is deactivating...');
}
