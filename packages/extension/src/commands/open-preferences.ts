import type { VscodeCommand } from "@/libs/vscode-command"
import { openPreferences } from "@/utils/open-preference"
import { COMMAND_OPEN_PREFERENCE } from "@shared"

export class OpenPreferencesCommand implements VscodeCommand {
  public id = COMMAND_OPEN_PREFERENCE

  async execute(): Promise<void> {
    console.log("Open preferences command triggered")

    await openPreferences()
  }
}
