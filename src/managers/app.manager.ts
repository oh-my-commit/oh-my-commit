import { SelectSolutionCommand } from "@/commands/select-solution.command";
import { OpenPreferencesCommand } from "@/commands/open-preferences.command";
import { QuickCommitCommand } from "@/commands/quick-commit.command";
import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { CommandManager } from "./command.manager";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "./solution.manager";
import { StatusBarManager } from "./status-bar.manager";
import { isEqual, pick } from "lodash-es";

export class AppManager {
  private context: vscode.ExtensionContext;
  private gitService: VscodeGitService;
  private solutionManager: SolutionManager;
  private commandManager: CommandManager;
  private statusBarManager: StatusBarManager;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.gitService = new VscodeGitService();
    this.solutionManager = new SolutionManager();
    this.commandManager = new CommandManager(context);
    this.statusBarManager = new StatusBarManager(this.solutionManager);
  }

  public async initialize(): Promise<void> {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      console.log("No workspace found");
      throw new Error(
        "YAAC needs to be run in a workspace with a git repository"
      );
    }
    console.log(`Workspace root: ${workspaceRoot}`);

    try {
      // Initialize UI
      await this.statusBarManager.initialize();
      console.log("Core managers initialized");

      // Register commands
      this.registerCommands();
      console.log("Commands registered");

      // Setup Git integration
      await this.setupGitIntegration();
      console.log("Git integration setup completed");

      // update solutions
      const solutions = await this.solutionManager.getAvailableSolutions();
      const currentSolution = await this.solutionManager.getCurrentSolution();
      const target = {
        type: "string",
        description: "Current Solution",
        enum: solutions.map((s) => s.name),
        enumDescriptions: solutions.map((s) => s.description),
        default: currentSolution?.name,
      };
      await this.updateConfiguration(
        "yaac.currentSolution",
        target,
        (raw, target) => {
          const keys = Object.keys(target).filter((k) => k !== "default"); // except default
          return isEqual(pick(raw, keys), pick(target, keys));
        }
      );

      console.log("YAAC initialization completed");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      throw error;
    }
  }

  public dispose(): void {
    this.commandManager.dispose();
    // 添加其他需要清理的资源
  }

  private registerCommands(): void {
    this.commandManager.register(
      new QuickCommitCommand(
        this.gitService,
        this.solutionManager,
        this.context
      )
    );
    this.commandManager.register(
      new SelectSolutionCommand(this.solutionManager)
    );
    this.commandManager.register(new OpenPreferencesCommand());
  }

  private async setupGitIntegration(): Promise<void> {
    const isGitRepo = await this.gitService.isGitRepository();
    if (!isGitRepo) {
      throw new Error("Not a git repository");
    }
  }

  private async updateConfiguration(
    key: string,
    target: any,
    skip: (raw: any, target: any) => boolean
  ) {
    try {
      // 获取扩展的 package.json 路径
      const packageJsonPath = path.join(
        this.context.extensionPath,
        "package.json"
      );

      // 读取当前的 package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      // 确保必要的结构存在
      if (!packageJson.contributes) {
        packageJson.contributes = {};
      }
      if (!packageJson.contributes.configuration) {
        packageJson.contributes.configuration = {
          title: "YAAC",
          properties: {},
        };
      }

      const raw = packageJson.contributes.configuration.properties[key];

      if (skip(raw, target)) {
        return;
      }

      // 添加新的设置定义
      packageJson.contributes.configuration.properties[key] = target;

      // 写回 package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // 提示用户重新加载窗口
      const reload = await vscode.window.showInformationMessage(
        "设置定义已更新，需要重新加载窗口使其生效。",
        "重新加载"
      );

      if (reload === "重新加载") {
        await vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    } catch (error) {
      // @ts-ignore
      vscode.window.showErrorMessage(`添加设置定义失败: ${error.message}`);
    }
  }
}
