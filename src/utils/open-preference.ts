import vscode from "vscode";

export const openPreferences = async (key: string = "yaac") => {
  await vscode.commands.executeCommand("workbench.action.openSettings", key);
};
