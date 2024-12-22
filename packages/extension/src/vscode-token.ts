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
  GitService: new Token<VscodeGit>("VscodeGitService"),
  WebviewService: new Token<VscodeWebview>("VscodeWebviewService"),
  QuickCommitService: new Token<QuickCommitCommand>("VscodeQuickCommitService"),
  StatusbarService: new Token<StatusBarManager>("VscodeStatusbarService"),
  CommandService: new Token<CommandManager>("VscodeCommandService"),
  OpenPreferencesService: new Token<OpenPreferencesCommand>("VscodeOpenPreferencesService"),
  SelectModelService: new Token<SelectModelCommand>("VscodeSelectModelService"),
} as const
