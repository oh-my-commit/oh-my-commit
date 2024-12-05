import * as vscode from "vscode";
import { ConfigManager } from "./configManager";

export interface Solution {
  id: string;
  name: string;
  provider: string;
  description: string;
  metrics: {
    cost: number; // 1-10
    performance: number; // 1-10
    quality: number; // 1-10
  };
}

export class SolutionManager {
  private currentSolutionId: string | undefined;

  constructor(private configManager: ConfigManager) {
    this.initialize();
  }

  private async initialize() {
    // 加载默认方案
    const defaultSolution = vscode.workspace
      .getConfiguration("yaac")
      .get<string>("defaultSolution");
    if (defaultSolution) {
      await this.switchSolution(defaultSolution);
    }
  }

  public async getAvailableSolutions(): Promise<Solution[]> {
    // 这里先返回一些示例方案，后续可以从配置或远程加载
    const solutions = [
      {
        id: "official_recommend",
        name: "Official Recommend",
        provider: "yaac",
        description: "Balanced performance and quality",
        metrics: { cost: 5, performance: 8, quality: 8 },
      },
      {
        id: "gcop_fast",
        name: "GCOP Fast",
        provider: "gcop",
        description: "Optimized for speed",
        metrics: { cost: 3, performance: 9, quality: 6 },
      },
      {
        id: "premium_quality",
        name: "Premium Quality",
        provider: "yaac",
        description: "Best quality output",
        metrics: { cost: 8, performance: 6, quality: 9 },
      },
    ];

    // 检查每个方案的 API 配置是否有效
    return await Promise.all(
      solutions.map(async (solution) => {
        const apiConfig = await this.configManager.getApiConfig(
          solution.provider
        );
        if (apiConfig) {
          return {
            ...solution,
            description: `${solution.description} (API Configured)`,
          };
        }
        return solution;
      })
    );
  }

  public async getCurrentSolution(): Promise<Solution | undefined> {
    if (!this.currentSolutionId) {
      return undefined;
    }

    const solutions = await this.getAvailableSolutions();
    return solutions.find((s) => s.id === this.currentSolutionId);
  }

  public async switchSolution(solutionId: string) {
    const solutions = await this.getAvailableSolutions();
    const solution = solutions.find((s) => s.id === solutionId);

    if (!solution) {
      throw new Error(`Solution ${solutionId} not found`);
    }

    // 检查是否需要配置 API
    const apiConfig = await this.configManager.getApiConfig(solution.provider);
    if (!apiConfig) {
      const shouldConfigure = await vscode.window.showInformationMessage(
        `${solution.name} requires API configuration for ${solution.provider}. Configure now?`,
        "Yes",
        "No"
      );

      if (shouldConfigure === "Yes") {
        vscode.commands.executeCommand("yaac.configureApi");
        return;
      }
    }

    this.currentSolutionId = solutionId;
    await vscode.workspace
      .getConfiguration("yaac")
      .update("defaultSolution", solutionId, true);
  }

  public async setCurrentSolution(solution: Solution) {
    this.currentSolutionId = solution.id;
    await vscode.workspace.getConfiguration().update('yaac.defaultSolution', solution.id, true);
  }
}
