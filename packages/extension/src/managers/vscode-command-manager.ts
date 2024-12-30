/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Container, Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  COMMAND_OPEN_PREFERENCE,
  COMMAND_QUICK_COMMIT,
  COMMAND_SELECT_MODEL,
} from "@shared/common"

import { OpenPreferencesCommand } from "@/commands/open-preferences"
import { QuickCommitCommand } from "@/commands/quick-commit"
import { SelectModelCommand } from "@/commands/select-model"
import type { VscodeCommand } from "@/interface/vscode-command"
import { VscodeLogger } from "@/managers/vscode-logger"
import { TOKENS } from "@/managers/vscode-tokens"

@Service()
export class CommandManager {
  private readonly commands: Map<string, VscodeCommand> = new Map()

  constructor(
    @Inject(TOKENS.Context)
    private readonly context: vscode.ExtensionContext,
    private readonly logger: VscodeLogger
  ) {
    // Register all commands
    this.registerCommand(
      COMMAND_OPEN_PREFERENCE,
      Container.get(OpenPreferencesCommand)
    )

    this.registerCommand(
      COMMAND_QUICK_COMMIT,
      Container.get(QuickCommitCommand)
    )

    this.registerCommand(
      COMMAND_SELECT_MODEL,
      Container.get(SelectModelCommand)
    )
  }

  private registerCommand(id: string, command: VscodeCommand): void {
    this.commands.set(id, command)
    this.logger.info(`Registering command: ${id}`)

    const disposable = vscode.commands.registerCommand(id, async () => {
      try {
        await command.execute()
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred"
        this.logger.error(`Command ${id} failed: ${message}`)
        void vscode.window.showErrorMessage(`Command failed: ${message}`)
      }
    })

    this.context.subscriptions.push(disposable)
    this.logger.info(`Registered command: ${id}`)
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
