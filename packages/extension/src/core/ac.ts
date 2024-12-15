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

  constructor(app: AppManager) {
    super();

    this.providers.push(new OmcProvider());
  }

  get models() {
    return this.providers.flatMap((p) => p.models);
  }

  get modelId() {
    // return this.config.get<string>(SETTING_MODEL_ID);
    const modelId = vscode.workspace
      .getConfiguration("ohMyCommits")
      .get<string>("model.id");
    // this.logger.info("modelID: ", modelId);
    return modelId;
  }

  get model() {
    const models = this.models;
    const modelId = this.modelId;
    const model = models.find((model) => model.id === this.modelId);
    // this.logger.info("get model: ", { modelId, models, model });
    return model;
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

    this.config.update(SETTING_MODEL_ID, modelId, true);

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
        await openPreferences("oh-my-commits.apiKeys");
      }
    }

    return true;
  }

  public async generateCommit(diff: DiffResult): Promise<GenerateCommitResult> {
    this.logger.info(
      `Generating commit: `,
      JSON.stringify({ provider: this.provider, model: this.model }, null, 2)
    );
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
