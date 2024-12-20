import { BaseCommand, type VscodeCommand } from "@/vscode-command"
import { COMMAND_SELECT_MODEL, CommitManager } from "@shared/common"
import * as vscode from "vscode"

export class SelectModelCommand extends BaseCommand implements VscodeCommand {
  public id = COMMAND_SELECT_MODEL

  private acManager: CommitManager

  constructor(acManager: CommitManager) {
    super()
    this.acManager = acManager
  }

  async execute(): Promise<void> {
    this.logger.info("Manage models command triggered")

    if (this.acManager.models.length === 0) {
      this.logger.info("No available models found")
      vscode.window.showErrorMessage("No available models")
      return
    }

    try {
      const selected = await vscode.window.showQuickPick(
        this.acManager.models.map(s => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: s.metrics
            ? `Accuracy: ${s.metrics.accuracy}, Speed: ${s.metrics.speed}, Cost: ${s.metrics.cost}`
            : "No metrics available",
          picked: this.acManager.model?.id === s.id,
        })),
        {
          placeHolder: "Select AI Model to Use",
          matchOnDescription: true,
          matchOnDetail: true,
        },
      )

      if (selected) {
        await this.acManager.selectModel(selected.id)
      }
    } catch (error: unknown) {
      console.error("Error in manage models command:", error)
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      vscode.window.showErrorMessage(`Failed to manage models: ${message}`)
    }
  }
}
