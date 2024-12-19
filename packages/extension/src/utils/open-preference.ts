import { APP_ID } from "@shared"
import vscode from "vscode"

export const openPreferences = async (key: string = APP_ID) => {
  await vscode.commands.executeCommand("workbench.action.openSettings", key)
}
