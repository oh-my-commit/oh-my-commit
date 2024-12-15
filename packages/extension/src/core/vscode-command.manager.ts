import * as vscode from "vscode";
import { VscodeCommand, BaseCommand } from "@/core/vscode-commands/types";
import { AppManager } from "@/core";
import {
  CommitCommand,
  InitCommand,
  GenerateCommand,
  CheckCommand,
  UseConventionalCommand,
  UseSimpleCommand,
  UseEnglishCommand,
  UseChineseCommand,
  TeamModeCommand,
  TeamInitCommand,
  TeamCheckCommand,
  DebugCommand,
} from "@/core/vscode-commands/shell-commands";

export class CommandManager {
  private commands: Map<string, VscodeCommand> = new Map();
  private context: vscode.ExtensionContext;
  private logger: any;

  constructor(app: AppManager) {
    this.context = app.getContext();
    this.logger = app.getLogger();
    BaseCommand.setLogger(app.getLogger());
  }

  public initialize(): void {
    this.logger.info("Initializing CommandManager");
    this.registerCommands();
  }

  private registerCommands(): void {
    // Register all shell commands
    this.register(new CommitCommand());
    this.register(new InitCommand());
    this.register(new GenerateCommand());
    this.register(new CheckCommand());
    this.register(new UseConventionalCommand());
    this.register(new UseSimpleCommand());
    this.register(new UseEnglishCommand());
    this.register(new UseChineseCommand());
    this.register(new TeamModeCommand());
    this.register(new TeamInitCommand());
    this.register(new TeamCheckCommand());
    this.register(new DebugCommand());
  }

  register(command: VscodeCommand): void {
    const disposable = vscode.commands.registerCommand(command.id, async () => {
      console.log(`Command triggered: ${command.id}`);
      try {
        await command.execute();
      } catch (error: unknown) {
        console.error(`Error executing command ${command.id}:`, error);
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        vscode.window.showErrorMessage(
          `Failed to execute ${command.id}: ${message}`
        );
      }
    });

    this.context.subscriptions.push(disposable);
    this.commands.set(command.id, command);
    console.log(`Registered command: ${command.id}`);
  }

  getCommand(id: string): VscodeCommand | undefined {
    return this.commands.get(id);
  }

  dispose(): void {
    this.commands.clear();
  }
}
