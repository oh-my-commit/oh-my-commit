import { OpenPreferencesCommand } from "@/commands/open-preferences"
import { QuickCommitCommand } from "@/commands/quick-commit"
import { SelectModelCommand } from "@/commands/select-model"
import { Loggable } from "@/features/mixins"
import type { VscodeCommand } from "@/vscode-command"
import type { VscodeGit } from "@/vscode-git"
import {
  COMMAND_OPEN_PREFERENCE,
  COMMAND_QUICK_COMMIT,
  COMMAND_SELECT_MODEL,
  CommitManager,
} from "@shared/common"
import * as vscode from "vscode"

export class CommandManager extends Loggable(class {}) {
  private readonly commands: Map<string, VscodeCommand> = new Map()

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly gitService: VscodeGit,
    private readonly commitManager: CommitManager,
  ) {
    super()

    // Register all commands
    this.registerCommand(COMMAND_OPEN_PREFERENCE, new OpenPreferencesCommand())
    this.registerCommand(
      COMMAND_QUICK_COMMIT,
      new QuickCommitCommand(gitService, context, commitManager),
    )
    this.registerCommand(COMMAND_SELECT_MODEL, new SelectModelCommand(commitManager))
  }

  private registerCommand(id: string, command: VscodeCommand): void {
    this.commands.set(id, command)
    this.logger.info(`Registering command: ${id}`)

    const disposable = vscode.commands.registerCommand(id, async () => {
      try {
        await command.execute()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred"
        this.logger.error(`Command ${id} failed: ${message}`)
        vscode.window.showErrorMessage(`Command failed: ${message}`)
      }
    })

    this.context.subscriptions.push(disposable)
  }

  public dispose(): void {
    // this.logger.info("Disposing command manager");
    for (const command of this.commands.values()) {
      if ("dispose" in command) {
        ;(command as { dispose(): void }).dispose()
      }
    }
  }
}
