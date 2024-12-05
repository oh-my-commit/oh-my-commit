import {ManageSolutionsCommand} from "@/commands/manage-solutions.command";
import {OpenPreferencesCommand} from "@/commands/open-preferences.command";
import {QuickCommitCommand} from "@/commands/quick-commit.command";
import * as vscode from "vscode";
import {StatusBarManager} from "../ui/status-bar";
import {CommandManager} from "./command.manager";
import {GitManager} from "./git.manager";
import {SolutionManager} from "./solution.manager";

export class AppManager {
    private gitManager: GitManager;
    private solutionManager: SolutionManager;
    private commandManager: CommandManager;
    private statusBarManager: StatusBarManager;

    constructor(context: vscode.ExtensionContext) {
        this.gitManager = new GitManager();
        this.solutionManager = new SolutionManager();
        this.commandManager = new CommandManager(context);
        this.statusBarManager = new StatusBarManager(this.solutionManager);
    }

    public async initialize(): Promise<void> {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            console.log("No workspace found");
            throw new Error("YAAC needs to be run in a workspace with a git repository");
        }
        console.log(`Workspace root: ${workspaceRoot}`);

        try {
            // Initialize UI
            await this.statusBarManager.initialize();
            console.log("Core managers initialized");

            // Register commands
            this.registerCommands();
            console.log("Commands registered");

            // Setup Git integration
            await this.setupGitIntegration();
            console.log("Git integration setup completed");

            console.log("YAAC initialization completed");
        } catch (error) {
            console.error("Failed to initialize app:", error);
            throw error;
        }
    }

    public dispose(): void {
        this.commandManager.dispose();
        // 添加其他需要清理的资源
    }

    private registerCommands(): void {
        this.commandManager.register(new QuickCommitCommand(this.gitManager, this.solutionManager))
        this.commandManager.register(new ManageSolutionsCommand(this.solutionManager))
        this.commandManager.register(new OpenPreferencesCommand())
    }

    private async setupGitIntegration(): Promise<void> {
        // Setup Git status listener
        this.gitManager.onGitStatusChanged(async (isGit) => {
            console.log(`Git status changed: ${isGit ? "initialized" : "removed"}`);
            await this.updateGitStatus(isGit);
        });

        // Initial Git check
        const isGit = await this.gitManager.isGitRepository();
        await this.updateGitStatus(isGit);
    }

    private async updateGitStatus(isGit: boolean): Promise<void> {
        if (isGit) {
            this.statusBarManager.show();
            await vscode.commands.executeCommand("setContext", "yaac.isGitRepository", true);
        } else {
            this.statusBarManager.hide();
            await vscode.commands.executeCommand("setContext", "yaac.isGitRepository", false);
        }
    }
}
