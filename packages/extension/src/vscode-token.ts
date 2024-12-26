import { Token } from "typedi"
import type * as vscode from "vscode"

import type { CommandManager } from "./commands/command-manager"
import type { OpenPreferencesCommand } from "./commands/open-preferences"
import type { QuickCommitCommand } from "./commands/quick-commit"
import type { SelectModelCommand } from "./commands/select-model"
import type { VscodeGit } from "./vscode-git"
import type { StatusBarManager } from "./vscode-statusbar"
import type { VscodeWebview } from "./vscode-webview"

export const VSCODE_TOKENS = {
  Context: new Token<vscode.ExtensionContext>("VSCodeContext"),
  Git: new Token<VscodeGit>("VscodeGitService"),
  Webview: new Token<VscodeWebview>("VscodeWebviewService"),
  QuickCommitCommand: new Token<QuickCommitCommand>("VscodeQuickCommitService"),
  StatusbarService: new Token<StatusBarManager>("VscodeStatusbarService"),
  CommandManager: new Token<CommandManager>("VscodeCommandService"),
  OpenPreferencesCommand: new Token<OpenPreferencesCommand>("VscodeOpenPreferencesService"),
  SelectModelService: new Token<SelectModelCommand>("VscodeSelectModelService"),
} as const
