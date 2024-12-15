import { VscodeCommand } from "@/core/vscode-commands/types";
import { AcManager } from "@/core/ac";
import * as vscode from "vscode";

export class SelectModelCommand implements VscodeCommand {
  public id = "oh-my-commit.selectModel";

  private acManager: AcManager;

  constructor(acManager: AcManager) {
    this.acManager = acManager;
  }

  async execute(): Promise<void> {
    console.log("Manage models command triggered");

    const models = await this.acManager.getAvailableModels();
    if (models.length === 0) {
      console.log("No available models found");
      vscode.window.showErrorMessage("No available models");
      return;
    }

    try {
      const currentModel = await this.acManager.getCurrentModel();

      const selected = await vscode.window.showQuickPick(
        models.map((s) => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: `Accuracy: ${s.metrics.accuracy}, Speed: ${s.metrics.speed}, Cost: ${s.metrics.cost}`,
          picked: currentModel?.id === s.id,
        })),
        {
          placeHolder: "Select AI Model to Use",
          matchOnDescription: true,
          matchOnDetail: true,
        }
      );

      if (selected) {
        console.log(`Switched to model: ${selected.id}`);
        await this.acManager.selectModel(selected.id);
      }
    } catch (error: unknown) {
      console.error("Error in manage models command:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      vscode.window.showErrorMessage(`Failed to manage models: ${message}`);
    }
  }
}
