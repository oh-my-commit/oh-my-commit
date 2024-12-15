import * as vscode from "vscode";
import { AcManager } from "@/core/ac";

import { StatusBarManager } from "@/core/vscode-status-bar";
import { VscodeGitService } from "@/core/vscode-git";
import { Loggable } from "@/types/mixins";
import { CommandManager } from "./vscode-commands/command-manager";

export class AppManager extends Loggable(class {}) {
  public context: vscode.ExtensionContext;
  public acManager: AcManager;
  public commandManager: CommandManager;
  public gitService: VscodeGitService;

  constructor(context: vscode.ExtensionContext) {
    super();

    this.context = context;

    this.logger = vscode.window.createOutputChannel("Oh My Commits", {
      log: true,
    });
    this.logger.info("Initializing Oh My Commits");

    // const gitService = new VscodeGitService();
    this.acManager = new AcManager(this);
    const statusBarManager = new StatusBarManager(this);
    this.gitService = new VscodeGitService();
    this.commandManager = new CommandManager(
      context,
      this.gitService,
      this.acManager
    );

    this.logger.info("Initialized Oh My Commits");
  }

  public dispose(): void {
    this.logger.info("Disposing Oh My Commits");
    this.commandManager.dispose();
    this.logger.dispose();
  }
}
