import * as vscode from 'vscode';

export interface ApiConfig {
    provider: string;
    credentials: {
        [key: string]: string;
    };
    settings?: {
        [key: string]: any;
    };
}

export interface YaacConfig {
    currentSolution?: string;
    providers: Record<string, boolean>;
}

export const getWorkspaceConfig = () => vscode.workspace.getConfiguration('yaac');

