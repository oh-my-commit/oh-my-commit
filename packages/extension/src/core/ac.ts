import * as vscode from "vscode";
import { Provider } from "@oh-my-commit/shared/types/provider";
import { Model } from "@oh-my-commit/shared/types/model";
import { GenerateCommitResult } from "@oh-my-commit/shared/types/commit";
import { DiffResult } from "simple-git";
import { Loggable } from "@/types/mixins";
import { openPreferences } from "@/utils/open-preference";
import { presetAiProviders } from "@/types/provider";
import { AppManager } from "@/core";
import { OhMyCommitProvider } from "@oh-my-commit/shared/providers/oh-my-commit";
import { convertToGitChangeSummary } from "@/utils/git-converter";

export class AcManager extends Loggable(class {}) {
  private providers: Provider[] = [];
  private currentModelId?: string;
  public config: vscode.WorkspaceConfiguration;

  constructor(app: AppManager) {
    super();
    this.logger = app.getLogger();
    AcManager.setLogger(this.logger);
    this.config = vscode.workspace.getConfiguration("");
  }

  public initialize(): void {
    this.logger.info("Initializing AcManager");
    // Register default providers
    this.registerProvider(
      new OhMyCommitProvider(
        this.logger,
        this.config.get("omc.apiKeys.anthropic")
      )
    );
    // Load initial config
    this.loadConfig();
  }

  private loadConfig() {
    const config = vscode.workspace.getConfiguration("");
    this.currentModelId = config.get<string>("omc.model");
  }

  public async getAvailableModels(): Promise<Model[]> {
    const models: Model[] = [];
    const providerClasses = [OhMyCommitProvider];

    for (const providerClass of providerClasses) {
      if (!providerClass.enabled) {
        continue;
      }

      const providerModels = providerClass.models.map((model: Model) => ({
        ...model,
        providerId: providerClass.id,
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
    return models.find((model) => model.id === this.currentModelId);
  }

  public async selectModel(modelId: string): Promise<boolean> {
    const models = await this.getAvailableModels();
    const model = models.find((s) => s.id === modelId);

    if (!model) {
      this.logger.error(`Model ${modelId} not found`);
      return false;
    }

    this.currentModelId = modelId;
    await vscode.workspace
      .getConfiguration("")
      .update("omc.model", modelId, true);

    const providerId = model.providerId;
    if (presetAiProviders.includes(providerId)) {
      const configureNow = "Configure Now";
      const configureLater = "Configure Later";
      const response = await vscode.window.showErrorMessage(
        `使用该模型需要先填写目标 ${providerId.toUpperCase()}_API_KEY`,
        configureNow,
        configureLater
      );

      if (response === configureNow) {
        await openPreferences("omc.apiKeys");
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

    return provider.generateCommit(
      convertToGitChangeSummary(diff),
      currentModel,
      {
        lang: vscode.env.language,
      }
    );
  }

  public registerProvider(provider: Provider): void {
    if (
      !this.providers.find(
        (p) =>
          (p.constructor as typeof Provider).id ===
          (provider.constructor as typeof Provider).id
      )
    ) {
      this.providers.push(provider);
    }
  }

  public unregisterProvider(providerId: string): void {
    const index = this.providers.findIndex(
      (p) => (p.constructor as typeof Provider).id === providerId
    );
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
  }

  public async updateProvidersConfig(): Promise<void> {
    const config = vscode.workspace.getConfiguration("");
    const providersConfig =
      config.get<Record<string, boolean>>("omc.providers");

    if (providersConfig) {
      const providerClasses = [OhMyCommitProvider];
      for (const providerClass of providerClasses) {
        providerClass.enabled = providersConfig[providerClass.id] ?? true;
      }
    }
  }
}
