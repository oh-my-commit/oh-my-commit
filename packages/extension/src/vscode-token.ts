/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"
import type * as vscode from "vscode"

import { TOKENS as TOKENS_BASE } from "@shared/common"

import { IOrchestrator } from "@/orchestrator"
import type { IVscodeWorkspaceMonitor } from "@/vscode-workspace-monitor"

import type { CommandManager } from "./command-manager"
import type { OpenPreferencesCommand } from "./commands/open-preferences"
import type { QuickCommitCommand } from "./commands/quick-commit"
import type { SelectModelCommand } from "./commands/select-model"
import type { VscodeGit } from "./vscode-git"
import type { StatusBarManager } from "./vscode-statusbar"
import type { WebviewManager } from "./vscode-webview"

export const TOKENS = {
  ...TOKENS_BASE,
  Context: new Token<vscode.ExtensionContext>("Context"),
  GitManager: new Token<VscodeGit>("GitManager"),
  Webview: new Token<WebviewManager>("Webview"),
  StatusBar: new Token<StatusBarManager>("StatusBar"),
  CommandManager: new Token<CommandManager>("CommandManager"),
  QuickCommitCommand: new Token<QuickCommitCommand>("QuickCommitCommand"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>(
    "OpenPreferencesCommand"
  ),
  SelectModelCommand: new Token<SelectModelCommand>("SelectModelCommand"),
  WorkspaceMonitor: new Token<IVscodeWorkspaceMonitor>("WorkspaceMonitor"),
  CommitOrchestrator: new Token<IOrchestrator>("CommitOrchestrator"),
} as const
