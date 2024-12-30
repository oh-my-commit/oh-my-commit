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
import type { IOrchestrator } from "@/managers/orchestrator"
import type { CommandManager } from "@/managers/vscode-command-manager"
import type { IPreferenceMonitor } from "@/managers/vscode-preference-monitor"
import type { IStatusBarManager } from "@/managers/vscode-statusbar"
import type { IWebviewManager } from "@/webview/vscode-webview"
import type { IWebviewMessageHandler } from "@/webview/vscode-webview-message-handler"

export const TOKENS = {
  ...TOKENS_BASE,
  Context: new Token<vscode.ExtensionContext>("Context"),
  WebviewManager: new Token<IWebviewManager>("Webview"),
  WebviewMessageHandler: new Token<IWebviewMessageHandler>(
    "WebviewMessageHandler"
  ),
  PreferenceMonitor: new Token<IPreferenceMonitor>("PreferenceMonitor"),
  CommitMessageStore: new Token<unknown>("CommitMessageStore"),
  StatusBar: new Token<IStatusBarManager>("StatusBar"),
  Orchestrator: new Token<IOrchestrator>("Orchestrator"),

  QuickCommitCommand: new Token<QuickCommitCommand>("QuickCommitCommand"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>(
    "OpenPreferencesCommand"
  ),
  SelectModelCommand: new Token<SelectModelCommand>("SelectModelCommand"),
  CommandManager: new Token<CommandManager>("CommandManager"),
} as const
