/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"
import type * as vscode from "vscode"

import { TOKENS as TOKENS_BASE } from "@shared/common"

import type { CommandManager } from "./command-manager"
import type { OpenPreferencesCommand } from "./commands/open-preferences"
import type { QuickCommitCommand } from "./commands/quick-commit"
import type { SelectModelCommand } from "./commands/select-model"
import type { VscodeConfig } from "./vscode-commit-adapter"
import type { VscodeGit } from "./vscode-git"
import type { StatusBarManager } from "./vscode-statusbar"
import type { VscodeWebview } from "./vscode-webview"

export const TOKENS = {
  ...TOKENS_BASE,
  Context: new Token<vscode.ExtensionContext>("vscode.context"),
  GitManager: new Token<VscodeGit>("vscode.git"),
  Webview: new Token<VscodeWebview>("vscode.webview"),
  Config: new Token<VscodeConfig>("vscode.config"),
  StatusBar: new Token<StatusBarManager>("vscode.statusbar"),
  QuickCommitCommand: new Token<QuickCommitCommand>("VscodeQuickCommitService"),
  StatusbarService: new Token<StatusBarManager>("VscodeStatusbarService"),
  CommandManager: new Token<CommandManager>("VscodeCommandService"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>(
    "VscodeOpenPreferencesService"
  ),
  SelectModelService: new Token<SelectModelCommand>("VscodeSelectModelService"),
} as const
