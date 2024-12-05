import * as vscode from "vscode";
import { ConfigManager } from "@/managers/config.manager";
import { Provider, Solution } from "../types/provider";
import { OpenAIProvider } from "../providers/open-ai.provider";

export class SolutionManager {
  private currentSolutionId: string | undefined;
  private providers: Provider[] = [];

  constructor(
    private configManager: ConfigManager,
  ) {
    this.initialize();
  }

  private async initialize() {
    // 注册所有providers
    this.registerProviders();

    // 从配置中加载provider状态
    await this.loadProviderStates();

    // 从配置中加载当前solution
    const currentSolution = vscode.workspace
      .getConfiguration("yaac")
      .get<string>("currentSolution");

    if (currentSolution) {
      try {
        await this.switchSolution(currentSolution);
        return;
      } catch (error) {
        console.warn(
          `Current solution ${currentSolution} not available: ${error}`
        );
      }
    }

    // 如果没有当前solution或它不可用，使用第一个可用的
    await this.switchToFirstAvailableSolution();
  }

  private registerProviders() {
    // 在这里注册所有providers
    this.providers = [
      new OpenAIProvider(),
      // 添加更多providers
    ];
  }

  private async loadProviderStates() {
    const config = vscode.workspace.getConfiguration("yaac");
    const providerStates = config.get<Record<string, boolean>>("providers", {});

    // 更新provider状态
    this.providers.forEach((provider) => {
      provider.enabled = providerStates[provider.id] ?? true;
    });
  }

  public async getAvailableSolutions(): Promise<Solution[]> {
    const solutions: Solution[] = [];

    for (const provider of this.providers) {
      if (!provider.enabled) {
        continue;
      }

      // 检查API配置
      const apiConfig = await this.configManager.getApiConfig(provider.id);
      const providerSolutions = provider.solutions.map((solution) => ({
        ...solution,
        description: apiConfig
          ? `${solution.description} (API Configured)`
          : `${solution.description} (API Required)`,
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

  private async validateSolution(solution: Solution): Promise<boolean> {
    const validationResult = await solution.validate();

    if (!validationResult.valid) {
      const message = validationResult.error || "Solution validation failed";

      // 如果有需要配置的项，提供快速跳转到设置的选项
      if (validationResult.requiredConfig?.length) {
        const configureNow = "Configure Now";
        const result = await vscode.window.showErrorMessage(
          message,
          configureNow
        );

        if (result === configureNow) {
          // 打开第一个配置项的设置页面
          const firstConfig = validationResult.requiredConfig[0];
          if (firstConfig.settingPath) {
            await vscode.commands.executeCommand(
              "workbench.action.openSettings",
              firstConfig.settingPath
            );
          }
        }
      } else {
        vscode.window.showErrorMessage(message);
      }

      return false;
    }

    return true;
  }

  public async switchToFirstAvailableSolution(): Promise<boolean> {
    const solutions = await this.getAvailableSolutions();

    for (const solution of solutions) {
      if (await this.validateSolution(solution)) {
        await this.switchSolution(solution.id);
        return true;
      }
    }

    vscode.window.showErrorMessage(
      "No available solutions found. Please configure at least one solution."
    );
    return false;
  }

  public async switchSolution(solutionId: string): Promise<boolean> {
    const solutions = await this.getAvailableSolutions();
    const solution = solutions.find((s) => s.id === solutionId);
    if (!solution) {
      throw new Error(`Solution ${solutionId} not found`);
    }

    if (!(await this.validateSolution(solution))) {
      return false;
    }

    // 更新当前solution
    this.currentSolutionId = solutionId;
    await vscode.workspace
      .getConfiguration("yaac")
      .update("currentSolution", solutionId, true);

    // 提示用户切换成功
    vscode.window.showInformationMessage(`已成功切换到 ${solution.name}`);

    return true;
  }

  public async toggleProvider(providerId: string, enabled: boolean) {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    provider.enabled = enabled;

    // 保存provider状态到配置
    const config = vscode.workspace.getConfiguration("yaac");
    const providerStates = config.get<Record<string, boolean>>("providers", {});
    await config.update(
      "providers",
      {
        ...providerStates,
        [providerId]: enabled,
      },
      true
    );

    // 如果当前solution属于被禁用的provider，切换到其他可用solution
    const currentSolution = await this.getCurrentSolution();
    if (
      currentSolution &&
      currentSolution.providerId === providerId &&
      !enabled
    ) {
      const availableSolutions = await this.getAvailableSolutions();
      if (availableSolutions.length > 0) {
        await this.switchSolution(availableSolutions[0].id);
      } else {
        this.currentSolutionId = undefined;
      }
    }
  }

  public getProviders(): Provider[] {
    return this.providers;
  }

  public async generateCommit(diff: string): Promise<{ message: string; error?: string }> {
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

  public async setCurrentSolution(solution: Solution) {
    if (!solution) {
      throw new Error("Solution cannot be null or undefined");
    }
    await this.switchSolution(solution.id);
  }
}
