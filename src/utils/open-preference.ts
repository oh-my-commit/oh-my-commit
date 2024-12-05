import vscode from "vscode";

export const openPreferences = async () => {
    await vscode.commands.executeCommand("workbench.action.openSettings", "yaac");
};