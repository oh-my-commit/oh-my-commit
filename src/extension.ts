import * as vscode from "vscode";
import { AppManager } from "./managers/app.manager";

async function addModelSetting() {
  try {
    const config = vscode.workspace.getConfiguration();

    // 定义新的设置选项
    const settingValue = {
      type: "string",
      description: "当前模型",
      enum: ["openai-gpt4", "openai-gpt35", "new-model"],
      enumDescriptions: [
        "OpenAI GPT-4（高准确度）",
        "OpenAI GPT-3.5（快速响应）",
        "新模型描述",
      ],
    };

    // 更新配置
    await config.update(
      "yaac.currentSolution",
      settingValue,
      vscode.ConfigurationTarget.Global
    );

    // 注册设置变更监听器
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("yaac.currentSolution")) {
        const newValue = config.get("yaac.currentSolution");
        console.log("设置已更新:", newValue);
      }
    });

    // 提示用户重新加载窗口
    const reload = await vscode.window.showInformationMessage(
      "新的设置选项已添加，需要重新加载窗口使其生效。",
      "重新加载"
    );

    console.log("addModelSetting reload", reload);

    if (reload === "重新加载") {
      await vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `添加设置失败: ${(error as { message: string }).message}`
    );
  }
}
export async function activate(context: vscode.ExtensionContext) {
  console.log("YAAC is now active!");

  try {
    const app = new AppManager(context);
    await app.initialize();

    console.log(`register addModelSetting`);
    let disposable = vscode.commands.registerCommand(
      "yaac.addModelSetting",
      addModelSetting
    );
    context.subscriptions.push(disposable);
    console.log(`addModelSetting registered`);

    context.subscriptions.push({ dispose: () => app.dispose() });
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
