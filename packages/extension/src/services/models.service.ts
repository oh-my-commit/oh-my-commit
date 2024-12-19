import {
  GenerateCommitResult,
  GenerateCommitDTO,
  BaseGenerateCommitProvider,
  SETTING_MODEL_ID,
  GenerateCommitInput,
} from "@oh-my-commit/shared";
import { presetAiProviders } from "@oh-my-commit/shared/common/config/providers";
import { Result, ResultAsync } from "neverthrow";
import * as vscode from "vscode";

import { AppManager } from "@/app.manager";
import { Loggable } from "@/types/mixins";
import { openPreferences } from "@/utils/open-preference";
import { OmcProvider } from "@oh-my-commit/shared";
import { DiffResult } from "simple-git";

export class AcManager extends Loggable(class {}) {
  private providers: BaseGenerateCommitProvider[] = [new OmcProvider()];

  constructor(app: AppManager) {
    super();
  }

  get models() {
    return this.providers.flatMap((p) => p.models);
  }

  get modelId() {
    return this.config.get<string>(SETTING_MODEL_ID);
  }

  get model() {
    return this.models.find((model) => model.id === this.modelId);
  }

  get provider() {
    return this.providers.find((p) =>
      p.models.some((model) => model.id === this.modelId)
    );
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
        await openPreferences("oh-my-commit.apiKeys");
      }
    }

    return true;
  }

  public async generateCommit(diff: DiffResult) {
    const model = this.model;
    this.logger.info("[AcManager] Generating commit using model: ", model);
    if (!model) throw new Error("No model selected");

    const provider = this.provider;
    this.logger.info(
      "[AcManager] Generating commit using provider: ",
      provider
    );
    if (!provider)
      throw new Error(`Provider ${this.model!.providerId} not found`);

    const options = {
      lang:
        this.config.get<string>("ohMyCommit.git.commitLanguage") ??
        vscode.env.language,
    };
    this.logger.info("options: ", options);

    const input: GenerateCommitInput = {
      diff,
      model: this.model!,
      options,
    };
    return await this.provider.generateCommit(input);
  }
}
