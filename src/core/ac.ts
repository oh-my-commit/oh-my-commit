import { Model } from "@/types/model";
import { openPreferences } from "@/utils/open-preference";
import * as vscode from "vscode";
import { OpenAIProvider } from "../providers/open-ai";
import { presetAiProviders, Provider } from "../types/provider";
import { isEqual, pick } from "lodash-es";

export const getWorkspaceConfig = () =>
  vscode.workspace.getConfiguration("yaac");

export class AcManager {
  private currentModelId: string | undefined;
  private providers: Provider[] = [
    new OpenAIProvider(), // 添加更多providers
  ];

  constructor() {
    // 从配置中加载provider状态和当前model
    this.loadConfig();
  }

  public async getAvailableModels(): Promise<Model[]> {
    const models: Model[] = [];

    for (const provider of this.providers) {
      if (!provider.enabled) {
        continue;
      }

      const providerModels = provider.models.map((model) => ({
        ...model,
        description: `${model.description} (API Required)`,
      }));

      models.push(...providerModels);
    }

    return models;
  }

  public async getCurrentModel(): Promise<Model | undefined> {
    if (!this.currentModelId) {
      return undefined;
    }

    const models = await this.getAvailableModels();
    return models.find((s) => s.id === this.currentModelId);
  }

  public async selectModel(modelId: string): Promise<boolean> {
    const models = await this.getAvailableModels();
    const model = models.find((s) => s.id === modelId);

    if (!model) {
      console.log(`Model ${modelId} not found`);
      return false;
    }

    // 立即更新 currentModelId 并通知订阅者
    this.currentModelId = modelId;

    // 保存到配置
    await getWorkspaceConfig().update("currentModel", modelId, true);

    const aiProviderId = model.aiProviderId as string;
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
    const currentModel = await this.getCurrentModel();
    if (!currentModel) {
      throw new Error("No model selected");
    }

    const provider = this.providers.find(
      (p) => p.id === currentModel.providerId
    );
    if (!provider) {
      throw new Error(`Provider ${currentModel.providerId} not found`);
    }

    return provider.generateCommit(diff, currentModel);
  }

  public registerProvider(provider: Provider) {
    if (!this.providers.find((p) => p.id === provider.id)) {
      this.providers.push(provider);
    }
  }

  public removeProvider(providerId: string) {
    const index = this.providers.findIndex((p) => p.id === providerId);
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
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

    // 加载当前 model
    this.currentModelId = config.get<string>("currentModel");
  }

  private async registerConfiguration() {
    const models = await this.getAvailableModels();
    const currentModel = await this.getCurrentModel();
    const target = {
      type: "string",
      description: "Current Auto Commit Model",
      enum: models.map((s) => s.name),
      enumDescriptions: models.map((s) => s.description),
      default: currentModel?.name,
    };
    await this.app.updateConfiguration(
      "yaac.ac.model",
      target,
      (raw, target) => {
        const keys = Object.keys(target).filter((k) => k !== "default"); // except default
        return isEqual(pick(raw, keys), pick(target, keys));
      }
    );
  }
}
