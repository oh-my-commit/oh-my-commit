/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Token } from "typedi"
import type * as vscode from "vscode"

import { TOKENS as TOKENS_BASE } from "@shared/server"

import type { IOrchestrator } from "@/orchestrator"

import type { CommandManager } from "./command-manager"
import type { OpenPreferencesCommand } from "./commands/open-preferences"
import type { QuickCommitCommand } from "./commands/quick-commit"
import type { SelectModelCommand } from "./commands/select-model"
import type { IWorkspaceSettings } from "./vscode-settings"
import type { IStatusBarManager } from "./vscode-statusbar"
import type { IWebviewManager } from "./vscode-webview"
import type { IWebviewMessageHandler } from "./vscode-webview-message-handler"

export const TOKENS = {
  ...TOKENS_BASE,
  Context: new Token<vscode.ExtensionContext>("Context"),
  WebviewManager: new Token<IWebviewManager>("Webview"),
  WebviewMessageHandler: new Token<IWebviewMessageHandler>(
    "WebviewMessageHandler"
  ),
  Settings: new Token<IWorkspaceSettings>("WorkspaceSettings"),
  Orchestrator: new Token<IOrchestrator>("Orchestrator"),
  StatusBar: new Token<IStatusBarManager>("StatusBar"),

  CommandManager: new Token<CommandManager>("CommandManager"),
  QuickCommitCommand: new Token<QuickCommitCommand>("QuickCommitCommand"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>(
    "OpenPreferencesCommand"
  ),
  SelectModelCommand: new Token<SelectModelCommand>("SelectModelCommand"),
} as const
