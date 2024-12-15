import * as vscode from "vscode";
import { AppManager } from "./core";

/**
 * @description
 * @author
 * @date 2023-02-20 14:30:00
 * @export
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    const app = new AppManager(context);
    // await app.initialize();
    context.subscriptions.push({ dispose: () => app.dispose() });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    vscode.window.showErrorMessage(
      `Failed to initialize Oh My Commits: ${message}`
    );
  }
}

export function deactivate() {
  // Clean up is handled by AppManager.dispose()
}
