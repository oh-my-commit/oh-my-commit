import { SelectModelCommand } from "@/core/vscode-commands/select-model";
import { OpenPreferencesCommand } from "@/core/vscode-commands/open-preferences";
import { QuickCommitCommand } from "@/core/vscode-commands/quick-commit";
import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { CommandManager } from "./vscode-command.manager";
import { VscodeGitService } from "@/core/vscode-git";
import { AcManager } from "./ac";
import { StatusBarManager } from "./vscode-status-bar";

export class AppManager {
  private context: vscode.ExtensionContext;
  private gitService: VscodeGitService;
  private acManager: AcManager;
  private commandManager: CommandManager;
  private statusBarManager: StatusBarManager;
  private logger: vscode.LogOutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    
    // Create a single logger instance for the entire extension
    this.logger = vscode.window.createOutputChannel("YAAC", { log: true });
    
    this.gitService = new VscodeGitService();
    this.acManager = new AcManager(this);
    this.commandManager = new CommandManager(context);
    this.statusBarManager = new StatusBarManager(this.acManager);
  }

  public getLogger(): vscode.LogOutputChannel {
    return this.logger;
  }

  public async initialize(): Promise<void> {
    // Clear log on startup
    this.logger.clear();
    this.logger.info("Initializing YAAC...");
    
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      this.logger.error("No workspace found");
      throw new Error(
        "YAAC needs to be run in a workspace with a git repository"
      );
    }
    this.logger.info(`Workspace root: ${workspaceRoot}`);

    try {
      // Initialize UI
      await this.statusBarManager.initialize();
      this.logger.info("Core managers initialized");

      // Register commands
      this.registerCommands();
      this.logger.info("Commands registered");

      // Setup Git integration
      await this.setupGitIntegration();
      this.logger.info("Git integration setup completed");

      this.logger.info("YAAC initialization completed");
    } catch (error) {
      this.logger.error(error as Error);
      throw error;
    }
  }

  public dispose(): void {
    this.logger.info("Disposing YAAC...");
    this.commandManager.dispose();
    this.logger.dispose();
  }

  private registerCommands(): void {
    this.commandManager.register(
      new QuickCommitCommand(this.gitService, this.acManager, this.context, this.logger)
    );
    this.commandManager.register(new SelectModelCommand(this.acManager));
    this.commandManager.register(new OpenPreferencesCommand());
  }

  private async setupGitIntegration(): Promise<void> {
    const isGitRepo = await this.gitService.isGitRepository();
    if (!isGitRepo) {
      throw new Error("Not a git repository");
    }
  }

  public async updateConfiguration(
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
