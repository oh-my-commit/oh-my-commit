/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { COMMAND_SELECT_MODEL, formatError } from "@shared/common"
import { GitCommitManager, TOKENS } from "@shared/server"

import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-logger"

@Service()
export class SelectModelCommand implements BaseCommand {
  public id = COMMAND_SELECT_MODEL

  constructor(
    @Inject(TOKENS.GitCommitManager)
    private readonly gitCommitManager: GitCommitManager,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger
  ) {}

  async execute(): Promise<void> {
    this.logger.info("Manage models command triggered")

    if (this.gitCommitManager.models.length === 0) {
      this.logger.info("No available models found")
      void vscode.window.showErrorMessage("No available models")
      return
    }

    try {
      const selected = await vscode.window.showQuickPick(
        this.gitCommitManager.models.map((s) => ({
          ...s,
          label: s.name,
          description: s.description,
          detail: s.metrics
            ? `Accuracy: ${s.metrics.accuracy}, Speed: ${s.metrics.speed}, Cost: ${s.metrics.cost}`
            : "No metrics available",
          picked: this.gitCommitManager.modelId === s.id,
        })),
        {
          placeHolder: `Select AI Model to Use`,
          matchOnDescription: true,
          matchOnDetail: true,
        }
      )

      if (selected) {
        await this.gitCommitManager.selectModel(selected.id)
      }
    } catch (error: unknown) {
      void vscode.window.showErrorMessage(
        formatError(error, "Failed to manage models")
      )
    }
  }

  async dispose(): Promise<void> {
    this.logger.info("Manage models command disposed")
  }
}
