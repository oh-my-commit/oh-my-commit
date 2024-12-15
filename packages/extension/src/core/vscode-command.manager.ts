import * as vscode from "vscode";
import { VscodeCommand, BaseCommand } from "@/core/vscode-commands/types";
import { AppManager } from "@/core";

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
    // Register all commands here
    // TODO: Add command registrations
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
