import type { VscodeCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"
import { VSCODE_TOKENS } from "@/vscode-token"
import {
  COMMAND_OPEN_PREFERENCE,
  COMMAND_QUICK_COMMIT,
  COMMAND_SELECT_MODEL,
  TOKENS,
} from "@shared/common"
import { Container, Inject, Service } from "typedi"
import * as vscode from "vscode"

@Service()
export class CommandManager {
  private readonly commands: Map<string, VscodeCommand> = new Map()

  @Inject(VSCODE_TOKENS.Context) private readonly context!: vscode.ExtensionContext
  @Inject(TOKENS.Logger) private readonly logger!: VscodeLogger

  constructor() {
    // Register all commands
    this.registerCommand(
      COMMAND_OPEN_PREFERENCE,
      Container.get(VSCODE_TOKENS.OpenPreferencesService),
    )
    this.registerCommand(COMMAND_QUICK_COMMIT, Container.get(VSCODE_TOKENS.QuickCommitService))
    this.registerCommand(COMMAND_SELECT_MODEL, Container.get(VSCODE_TOKENS.SelectModelService))
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
        void vscode.window.showErrorMessage(`Command failed: ${message}`)
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
