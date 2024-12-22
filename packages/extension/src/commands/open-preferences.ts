import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"
import { APP_ID_CAMEL, COMMAND_OPEN_PREFERENCE, TOKENS } from "@shared/common"
import { Inject, Service } from "typedi"
import vscode from "vscode"

@Service()
export class OpenPreferencesCommand implements BaseCommand {
  public id = COMMAND_OPEN_PREFERENCE

  @Inject(TOKENS.Logger) private logger!: VscodeLogger

  async execute(): Promise<void> {
    this.logger.info("Open preferences command triggered")

    await vscode.commands.executeCommand("workbench.action.openSettings", APP_ID_CAMEL)
  }

  async dispose(): Promise<void> {
    this.logger.info("Preferences command disposed")
  }
}
