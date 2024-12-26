/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import {
  COMMAND_SELECT_MODEL,
  type CommitManager,
  TOKENS,
  formatError,
} from "@shared/common"

import type { BaseCommand } from "@/vscode-command"
import { VscodeLogger } from "@/vscode-commit-adapter"

@Service()
export class SelectModelCommand implements BaseCommand {
  public id = COMMAND_SELECT_MODEL

  constructor(
    @Inject(TOKENS.CommitManager) private readonly commitManager: CommitManager,
    @Inject(TOKENS.Logger) private readonly logger: VscodeLogger
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
        this.commitManager.models.map((s) => ({
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
        }
      )

      if (selected) {
        await this.commitManager.selectModel(selected.id)
      }
    } catch (error: unknown) {
      vscode.window.showErrorMessage(
        `Failed to manage models: ${formatError(error)}`
      )
    }
  }

  async dispose(): Promise<void> {
    this.logger.info("Manage models command disposed")
  }
}
