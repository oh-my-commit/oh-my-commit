import * as vscode from "vscode";
import { AcManager } from "@/core/ac";
import { CommandManager } from "@/core/vscode-command.manager";
import { StatusBarManager } from "@/core/vscode-status-bar";
import { VscodeGitService } from "@/core/vscode-git";
import { Loggable } from "@/types/mixins";

export class AppManager extends Loggable(class {}) {
  private context: vscode.ExtensionContext;
  private gitService: VscodeGitService;
  private commandManager: CommandManager;
  private statusBarManager: StatusBarManager;
  public readonly acManager: AcManager;

  constructor(context: vscode.ExtensionContext) {
    super();
    this.context = context;
    this.logger = vscode.window.createOutputChannel("Oh My Commits", {
      log: true,
    }) as vscode.LogOutputChannel;
    AppManager.setLogger(this.logger);

    // Initialize services
    this.gitService = new VscodeGitService();
    this.acManager = new AcManager(this);
    this.commandManager = new CommandManager(this);
    this.statusBarManager = new StatusBarManager(this);

    // Initialize components
    this.logger.info("Initializing Oh My Commits components");

    this.commandManager.initialize();
    this.statusBarManager.initialize();
  }

  public async initialize(): Promise<void> {
    this.logger.info("Initializing Oh My Commits...");

    try {
      // Initialize UI
      this.logger.info("Core managers initialized");

      // Setup Git integration
      await this.setupGitIntegration();
      this.logger.info("Git integration setup complete");

      this.logger.info("Oh My Commits initialization complete");
    } catch (error) {
      this.logger.error(`Failed to initialize Oh My Commits: ${error}`);
      throw error;
    }
  }

  public dispose(): void {
    this.logger.dispose();
  }

  private async setupGitIntegration(): Promise<void> {
    const isGitRepo = await this.gitService.isGitRepository();
    if (!isGitRepo) {
      this.logger.warn("Not a Git repository");
      return;
    }
    this.logger.info("Git repository detected");
  }

  public getLogger(): vscode.LogOutputChannel {
    return this.logger;
  }

  public getContext(): vscode.ExtensionContext {
    return this.context;
  }
}
