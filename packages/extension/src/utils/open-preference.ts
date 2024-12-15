import vscode from "vscode";

export const openPreferences = async (key: string = "oh-my-commit") => {
  await vscode.commands.executeCommand("workbench.action.openSettings", key);
};
