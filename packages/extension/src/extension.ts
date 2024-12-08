import * as vscode from "vscode";
import { AppManager } from "./core";

/**
 * @description
 * @author
 * @date 2023-02-20 14:30:00
 * @export
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log("Starting YAAC activation...");
  console.log("Extension path:", context.extensionPath);
  console.log("Extension mode:", context.extensionMode);
  
  // 注册一个最简单的命令用于测试
  const disposable = vscode.commands.registerCommand('yaac.test', () => {
    vscode.window.showInformationMessage('YAAC Test Command');
  });
  context.subscriptions.push(disposable);
  
  try {
    console.log("Creating AppManager...");
    const app = new AppManager(context);
    console.log("Initializing AppManager...");
    await app.initialize();
    console.log("AppManager initialized successfully");

    context.subscriptions.push({ dispose: () => app.dispose() });
    console.log("YAAC activation completed successfully!");
  } catch (error: unknown) {
    console.error("Failed to initialize YAAC:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    vscode.window.showErrorMessage(`Failed to initialize YAAC: ${message}`);
  }
}

export function deactivate() {
  console.log("YAAC is now deactivated");
}
