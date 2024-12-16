import { CommandManager } from "@/commands/command-manager";
import { AcManager } from "@/services/models.service";
import { VscodeGitService } from "@/services/vscode-git.service";

import { StatusBarManager } from "@/status-bar";
import { Loggable } from "@/types/mixins";
import * as vscode from "vscode";

export class AppManager extends Loggable(class {}) {
  public context: vscode.ExtensionContext;
  public acManager: AcManager;
  public commandManager: CommandManager;
  public gitService: VscodeGitService;

  constructor(context: vscode.ExtensionContext) {
    super();

    this.context = context;

    this.logger.info("Initializing");

    this.acManager = new AcManager(this);
    this.gitService = new VscodeGitService();
    this.commandManager = new CommandManager(
      context,
      this.gitService,
      this.acManager,
    );

    new StatusBarManager(this);

    this.logger.info("Initialized");
  }

  public dispose(): void {
    this.logger.info("Disposing");
    this.commandManager.dispose();
  }
}
