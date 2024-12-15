import vscode from "vscode";

export const openPreferences = async (key: string = "oh-my-commits") => {
  await vscode.commands.executeCommand("workbench.action.openSettings", key);
};
