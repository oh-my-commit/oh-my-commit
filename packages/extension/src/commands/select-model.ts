import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"
import { COMMAND_SELECT_MODEL, TOKENS, type CommitManager } from "@shared/common"
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

@Service()
export class SelectModelCommand implements BaseCommand {
  public id = COMMAND_SELECT_MODEL

  constructor(
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger,
  ) {}

  async execute(): Promise<void> {
    this.logger.info("Manage models command triggered")

    if (this.commitManager.models.length === 0) {
      this.logger.info("No available models found")
      vscode.window.showErrorMessage("No available models")
      return
    }

    try {
      const selected = await vscode.window.showQuickPick(
        this.commitManager.models.map(s => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: s.metrics
            ? `Accuracy: ${s.metrics.accuracy}, Speed: ${s.metrics.speed}, Cost: ${s.metrics.cost}`
            : "No metrics available",
          picked: this.commitManager.modelId === s.id,
        })),
        {
          placeHolder: "Select AI Model to Use",
          matchOnDescription: true,
          matchOnDetail: true,
        },
      )

      if (selected) {
        await this.commitManager.selectModel(selected.id)
      }
    } catch (error: unknown) {
      console.error("Error in manage models command:", error)
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      vscode.window.showErrorMessage(`Failed to manage models: ${message}`)
    }
  }

  async dispose(): Promise<void> {
    this.logger.info("Manage models command disposed")
  }
}
