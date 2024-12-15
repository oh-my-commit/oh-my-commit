import * as vscode from "vscode";
import { AcManager } from "@/core/ac";

import { StatusBarManager } from "@/core/vscode-status-bar";
import { VscodeGitService } from "@/core/vscode-git";
import { Loggable } from "@/types/mixins";

export class AppManager extends Loggable(class {}) {
  public context: vscode.ExtensionContext;

  public readonly statusBarManager: StatusBarManager;
  public readonly gitService: VscodeGitService;
  public readonly acManager: AcManager;

  constructor(context: vscode.ExtensionContext) {
    super();

    this.context = context;

    this.logger = vscode.window.createOutputChannel("Oh My Commits", {
      log: true,
    });

    // Initialize services
    this.gitService = new VscodeGitService();
    this.acManager = new AcManager(this);
    this.statusBarManager = new StatusBarManager(this);

    // Initialize components
    this.logger.info("Initializing Oh My Commits components");
  }

  public async initialize(): Promise<void> {
    this.logger.info("Initializing Oh My Commits...");

    // Setup Git integration
    await this.setupGitIntegration();
  }

  private async setupGitIntegration(): Promise<void> {
    const isGitRepo = await this.gitService.isGitRepository();
    if (!isGitRepo) {
      this.logger.warn("Not a Git repository");
      return;
    }
    this.logger.info("Git repository detected");
  }

  public dispose(): void {
    this.logger.dispose();
  }
}
