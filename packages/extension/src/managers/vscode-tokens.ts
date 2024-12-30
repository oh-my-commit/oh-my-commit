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

import type { OpenPreferencesCommand } from "@/commands/open-preferences"
import type { QuickCommitCommand } from "@/commands/quick-commit"
import type { SelectModelCommand } from "@/commands/select-model"
import type { IWebviewManager } from "@/core/webview/vscode-webview"
import type { IWebviewMessageHandler } from "@/core/webview/vscode-webview-message-handler"
import type { CommandManager } from "@/managers/command-manager"
import type { IOrchestrator } from "@/managers/orchestrator"
import type { IPreferenceMonitor } from "@/managers/vscode-preference-monitor"
import type { IStatusBarManager } from "@/managers/vscode-statusbar"

export const TOKENS = {
  ...TOKENS_BASE,
  Context: new Token<vscode.ExtensionContext>("Context"),
  WebviewManager: new Token<IWebviewManager>("Webview"),
  WebviewMessageHandler: new Token<IWebviewMessageHandler>(
    "WebviewMessageHandler"
  ),
  PreferenceMonitor: new Token<IPreferenceMonitor>("PreferenceMonitor"),
  Orchestrator: new Token<IOrchestrator>("Orchestrator"),
  StatusBar: new Token<IStatusBarManager>("StatusBar"),

  CommandManager: new Token<CommandManager>("CommandManager"),
  QuickCommitCommand: new Token<QuickCommitCommand>("QuickCommitCommand"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>(
    "OpenPreferencesCommand"
  ),
  SelectModelCommand: new Token<SelectModelCommand>("SelectModelCommand"),
} as const
