/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Inject, Service } from "typedi"
import * as vscode from "vscode"

import { COMMAND_QUICK_COMMIT } from "@shared/common"

import type { BaseCommand } from "@/interface/vscode-command"
import type { IOrchestrator } from "@/managers/orchestrator"
import { TOKENS } from "@/managers/vscode-tokens"

@Service()
export class QuickCommitCommand implements BaseCommand {
  public id = COMMAND_QUICK_COMMIT
  public name = "Quick Commit"

  constructor(
    @Inject(TOKENS.Orchestrator)
    private readonly orchestrator: IOrchestrator
  ) {}

  public dispose(): void {
    // this.webviewManager?.dispose()
  }

  async execute(): Promise<void> {
    await this.orchestrator.generateCommit()
  }
}
