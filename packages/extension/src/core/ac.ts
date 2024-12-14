import { Model } from "@/types/model";
import { openPreferences } from "@/utils/open-preference";
import { GenerateCommitResult } from "@yaac/shared/types/commit";
import { DiffResult } from "simple-git";
import * as vscode from "vscode";
import { presetAiProviders, Provider } from "../types/provider";
import { isEqual, pick } from "lodash-es";
import { AppManager } from "@/core"; 

import { YaacProvider } from "../providers/yaac";

export const getWorkspaceConfig = () =>
  vscode.workspace.getConfiguration("yaac");

export class AcManager {
  private app: AppManager; 
  private currentModelId: string | undefined;
  private providers: Provider[] = [
    new YaacProvider(), 
  ];

  constructor(app: AppManager) {
    this.app = app;
    this.loadConfig();
  }

  public async getAvailableModels(): Promise<Model[]> {
    const models: Model[] = [];

    for (const provider of this.providers) {
      const providerClass = provider.constructor as typeof Provider;
      if (!providerClass.enabled) {
        continue;
      }

      const providerModels = providerClass.models.map((model: Model) => ({
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

    this.currentModelId = modelId;

    await getWorkspaceConfig().update("ac.model", modelId, true);

    const aiProviderId = model.aiProviderId as string;
    if (presetAiProviders.includes(aiProviderId)) {
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

  public async generateCommit(diff: DiffResult): Promise<GenerateCommitResult> {
    const currentModel = await this.getCurrentModel();
    if (!currentModel) {
      throw new Error("No model selected");
    }

    const provider = this.providers.find(
      (p) => (p.constructor as typeof Provider).id === currentModel.providerId
    );
    if (!provider) {
      throw new Error(`Provider ${currentModel.providerId} not found`);
    }

    return provider.generateCommit(diff, currentModel, {
      lang: this.config.get("git.commitLanguage"),
    });
  }

  public registerProvider(provider: Provider) {
    if (!this.providers.find((p) => (p.constructor as typeof Provider).id === (provider.constructor as typeof Provider).id)) {
      this.providers.push(provider);
    }
  }

  public removeProvider(providerId: string) {
    const index = this.providers.findIndex((p) => (p.constructor as typeof Provider).id === providerId);
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
  }

  public get config() {
    return getWorkspaceConfig();
  }

  private loadConfig() {
    const providersConfig = this.config.get<Record<string, boolean>>(
      "providers",
      {}
    );

    for (const provider of this.providers) {
      const providerClass = provider.constructor as typeof Provider;
      providerClass.enabled = providersConfig[providerClass.id] ?? true;
    }

    this.currentModelId = this.config.get<string>("ac.model");
  }

  protected async registerConfiguration() {
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
        const keys = Object.keys(target).filter((k) => k !== "default"); 
        return isEqual(pick(raw, keys), pick(target, keys));
      }
    );
  }
}
