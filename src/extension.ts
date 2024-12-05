import quickCommit from "@/commands/quick-commit";
import {ConfigManager} from "@/managers/config.manager";
import {GitManager} from "@/managers/git.manager";
import {SolutionManager} from "@/managers/solution.manager";
import {generateCommitMessage} from "@/utils/generate-commit-message";
import * as vscode from "vscode";
import {StatusBarManager} from "./ui/statusBar";

export async function activate(context: vscode.ExtensionContext) {
  // 添加激活日志
  console.log("YAAC is now active!");

  // 确保在工作区中
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    console.log("No workspace found");
    vscode.window.showErrorMessage(
      "YAAC needs to be run in a workspace with a git repository"
    );
    return;
  }
  console.log(`Workspace root: ${workspaceRoot}`);

  // 初始化核心管理器
  const configManager = new ConfigManager(context);
  const solutionManager = new SolutionManager(configManager);
  const statusBar = new StatusBarManager(solutionManager);
  await statusBar.initialize();
  const gitManager = new GitManager();

  console.log("Core managers initialized");

  // 监听 Git 状态变化
  gitManager.onGitStatusChanged(async (isGit) => {
    console.log(`Git status changed: ${isGit ? "initialized" : "removed"}`);
    if (isGit) {
      statusBar.show();
      vscode.commands.executeCommand(
        "setContext",
        "yaac.isGitRepository",
        true
      );
    } else {
      statusBar.hide();
      vscode.commands.executeCommand(
        "setContext",
        "yaac.isGitRepository",
        false
      );
    }
  });

  // 注册命令
  let disposables = [
    vscode.commands.registerCommand("yaac.quickCommit", async () => quickCommit(solutionManager, gitManager)),

    vscode.commands.registerCommand("yaac.manageSolutions", async () => {
      console.log("Manage solutions command triggered");

      const solutions = await solutionManager.getAvailableSolutions();
      if (solutions.length === 0) {
        vscode.window.showErrorMessage('没有可用的解决方案');
        return;
      }

      const currentSolution = await solutionManager.getCurrentSolution();
      const selected = await vscode.window.showQuickPick(
        solutions.map((s) => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: `准确度: ${s.metrics.accuracy}, 速度: ${s.metrics.speed}, 成本: ${s.metrics.cost}`,
          picked: currentSolution?.id === s.id
        })),
        {
          placeHolder: "选择要使用的 AI 模型",
          matchOnDescription: true,
          matchOnDetail: true,
        }
      );

      if (selected) {
        // 尝试切换 solution
        const success = await solutionManager.switchSolution(selected.id);
        if (!success) {
          console.log(`Failed to switch to solution: ${selected.id}`);
        }
      }
    }),
  ];

  context.subscriptions.push(...disposables);
  console.log("Commands registered");

  // 初始检查 Git 状态
  const isGit = await gitManager.isGitRepository();
  if (isGit) {
    statusBar.show();
    vscode.commands.executeCommand("setContext", "yaac.isGitRepository", true);
  }
}

export function deactivate() {
  console.log("YAAC is deactivating...");
}
