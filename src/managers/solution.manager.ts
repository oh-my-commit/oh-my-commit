import { Solution } from "@/types/solution";
import { openPreferences } from "@/utils/open-preference";
import * as vscode from "vscode";
import { OpenAIProvider } from "../providers/open-ai.provider";
import { presetAiProviders, Provider } from "../types/provider";

export const getWorkspaceConfig = () =>
  vscode.workspace.getConfiguration("yaac");

export class SolutionManager {
  private currentSolutionId: string | undefined;
  private providers: Provider[] = [
    new OpenAIProvider(), // 添加更多providers
  ];

  constructor() {
    // 从配置中加载provider状态和当前solution
    this.loadConfig();
    // 初始化时更新配置
    this.updateConfiguration();
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

  public async selectSolution(solutionId: string): Promise<boolean> {
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

    const aiProviderId = solution.aiProviderId as string;
    if (presetAiProviders.includes(aiProviderId)) {
      // todo: 检查是否有 yaac.apiKeys.${aiProviderId}，没有的话就引导用户去填写
      const configureNow = "Configure Now";
      const configureLater = "Configure Later";
      const response = await vscode.window.showErrorMessage(
        `使用该模型需要先填写目标 ${aiProviderId.toUpperCase()}_API_KEY`,
        configureNow,
        configureLater
      );

      if (response === configureNow) {
        await openPreferences("yaac.apiKeys");
      }
    }

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

    return provider.generateCommit(diff, currentSolution);
  }

  public registerProvider(provider: Provider) {
    if (!this.providers.find((p) => p.id === provider.id)) {
      this.providers.push(provider);
      this.updateConfiguration();
    }
  }

  public removeProvider(providerId: string) {
    const index = this.providers.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      this.providers.splice(index, 1);
      this.updateConfiguration();
    }
  }

  // 更新 VSCode 配置
  private async updateConfiguration() {
    const config = getWorkspaceConfig();

    // 更新 providers 配置
    const providersConfig: Record<string, boolean> = {};
    for (const provider of this.providers) {
      providersConfig[provider.id] = provider.enabled;
    }
    await config.update("providers", providersConfig, true);

    // 更新可用的 solutions 到配置的 enum 中
    // const solutions = await this.getAvailableSolutions();
  }

  private loadConfig() {
    // 加载 provider 状态
    const config = getWorkspaceConfig();
    const providersConfig = config.get<Record<string, boolean>>(
      "providers",
      {}
    );

    // 设置 providers 的启用状态
    for (const provider of this.providers) {
      provider.enabled = providersConfig[provider.id] ?? true;
    }

    // 加载当前 solution
    this.currentSolutionId = config.get<string>("currentSolution");
  }
}
