import { APP_ID } from "@oh-my-commits/shared";
import vscode from "vscode";

export const openPreferences = async (key: string = APP_ID) => {
  await vscode.commands.executeCommand("workbench.action.openSettings", key);
};
