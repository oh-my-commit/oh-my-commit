import * as vscode from "vscode";
import { Provider, SETTING_MODEL_ID } from "@oh-my-commits/shared";

import { GenerateCommitResult } from "@oh-my-commits/shared";
import { DiffResult } from "simple-git";
import { Loggable } from "@/types/mixins";
import { openPreferences } from "@/utils/open-preference";
import { presetAiProviders } from "@/types/provider";
import { AppManager } from "@/core";
import { OmcProvider } from "@oh-my-commits/shared";
import { convertToGitChangeSummary } from "@/utils/git-converter";

export class AcManager extends Loggable(class {}) {
  private providers: Provider[] = [];
  private modelId?: string;
  public config: vscode.WorkspaceConfiguration;

  constructor(app: AppManager) {
    super();
    this.logger = app.getLogger();
    AcManager.setLogger(this.logger);
    this.config = vscode.workspace.getConfiguration("");
    this.providers.push(new OmcProvider(this.logger));
    this.modelId = this.config.get<string>(SETTING_MODEL_ID);
  }

  get models() {
    return this.providers.flatMap((p) => p.models);
  }

  get model() {
    return this.models.find((model) => model.id === this.modelId);
  }

  get provider() {
    const model = this.model;
    if (!model) return;
    return this.providers.find((p) => p.models.includes(model));
  }

  public async selectModel(modelId: string): Promise<boolean> {
    const model = this.models.find((s) => s.id === modelId);

    if (!model) {
      this.logger.error(`Model ${modelId} not found`);
      return false;
    }

    this.modelId = modelId;
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
    if (!this.provider) {
      throw new Error(`Provider ${this.model!.providerId} not found`);
    }

    return this.provider.generateCommit(
      convertToGitChangeSummary(diff),
      this.model!,
      {
        lang: vscode.env.language,
      }
    );
  }
}
