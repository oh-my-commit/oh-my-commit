import { getWorkspaceConfig } from "@/types/config";
import {Solution} from "@/types/solution";
import * as vscode from "vscode";
import { OpenAIProvider } from "../providers/open-ai.provider";
import { Provider } from "../types/provider";

export class SolutionManager {
  private currentSolutionId: string | undefined;
  private providers: Provider[] = [];

  constructor() {
    this.initialize();
  }

  public async getAvailableSolutions(): Promise<Solution[]> {
    const solutions: Solution[] = [];

    for (const provider of this.providers) {
      if (!provider.enabled) {
        continue;
      }

      const providerSolutions = provider.solutions.map((solution) => ({
        ...solution,
        description: `${solution.description} (API Required)`,
      }));

      solutions.push(...providerSolutions);
    }

    return solutions;
  }

  public async getCurrentSolution(): Promise<Solution | undefined> {
    if (!this.currentSolutionId) {
      return undefined;
    }

    const solutions = await this.getAvailableSolutions();
    return solutions.find((s) => s.id === this.currentSolutionId);
  }

  public async switchSolution(solutionId: string): Promise<boolean> {
    const solutions = await this.getAvailableSolutions();
    const solution = solutions.find((s) => s.id === solutionId);

    if (!solution) {
      console.log(`Solution ${solutionId} not found`);
      return false;
    }

    // 立即更新 currentSolutionId 并通知订阅者
    this.currentSolutionId = solutionId;

    // 保存到配置
    await getWorkspaceConfig().update("currentSolution", solutionId, true);

    // 验证 solution 并显示配置提示（如果需要）
    await this.validateSolution(solution);

    return true;
  }

  public async generateCommit(
    diff: string
  ): Promise<{ message: string; error?: string }> {
    const currentSolution = await this.getCurrentSolution();
    if (!currentSolution) {
      throw new Error("No solution selected");
    }

    const provider = this.providers.find(
      (p) => p.id === currentSolution.providerId
    );
    if (!provider) {
      throw new Error(`Provider ${currentSolution.providerId} not found`);
    }

    // 生成之前先验证
    const validationResult = await currentSolution.validate();
    if (!validationResult.valid) {
      return {
        message: "",
        error: validationResult.error || "Solution validation failed",
      };
    }

    return provider.generateCommit(diff, currentSolution);
  }

  public async getSolutionValidationStatus(
    solution: Solution
  ): Promise<boolean> {
    const validationResult = await solution.validate();
    return validationResult.valid;
  }

  private async initialize() {
    // 注册所有providers
    this.registerProviders();

    // 从配置中加载provider状态和当前solution
    await this.loadConfig();

    // 如果没有当前solution或它不可用，使用第一个可用的
    if (!this.currentSolutionId) {
      await this.switchToFirstAvailableSolution();
    }
  }

  private registerProviders() {
    this.providers = [
      new OpenAIProvider(), // 添加更多providers
    ];
  }

  private async loadConfig() {
    // 加载 provider 状态
    const config = getWorkspaceConfig();
    const providerStates = config.get<Record<string, boolean>>("providers", {});

    this.providers.forEach((provider) => {
      provider.enabled = providerStates[provider.id] ?? true;
    });

    // 加载当前 solution
    this.currentSolutionId = config.get<string>("currentSolution");
  }

  private async validateSolution(solution: Solution): Promise<boolean> {
    const validationResult = await solution.validate();

    if (!validationResult.valid) {
      const message = validationResult.error || "Solution validation failed";

      if (validationResult.requiredConfig?.length) {
        const configureNow = "Configure Now";
        const configureLater = "Configure Later";
        const response = await vscode.window.showErrorMessage(
          message,
          configureNow,
          configureLater
        );

        if (response === configureNow) {
          await vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "yaac.apiKeys"
          );
        }
        // 无论是现在配置还是稍后配置，都允许切换
        return true;
      } else {
        vscode.window.showErrorMessage(message);
        return false;
      }
    }

    return true;
  }

  private async switchToFirstAvailableSolution(): Promise<boolean> {
    const solutions = await this.getAvailableSolutions();
    if (solutions.length === 0) {
      return false;
    }

    return this.switchSolution(solutions[0].id);
  }
}
