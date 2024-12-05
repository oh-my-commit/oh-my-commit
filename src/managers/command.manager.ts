import * as vscode from "vscode";

import { BaseCommand } from "@/commands/base.command";

export class CommandManager {
  private commands: Map<string, BaseCommand> = new Map();
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  register(command: BaseCommand): void {
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

  getCommand(id: string): BaseCommand | undefined {
    return this.commands.get(id);
  }

  dispose(): void {
    this.commands.clear();
  }
}
