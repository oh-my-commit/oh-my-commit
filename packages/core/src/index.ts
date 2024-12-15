import { DiffResult } from "simple-git";
import {
  GenerateCommitResult,
  CommitData,
} from "@oh-my-commit/shared/types/commit";
import { GitChangeSummary } from "@oh-my-commit/shared/types/git";
import { Result, ok, err } from "neverthrow";

export interface Model {
  id: string;
  name: string;
  providerId: string;
}

export interface Provider {
  generateCommit(
    diff: GitChangeSummary,
    model: Model,
    options: { lang: string }
  ): Promise<Result<CommitData, string>>;
}

export class CommitManager {
  private providers: Provider[] = [];
  private currentModelId?: string;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // TODO: Load configuration from file system
  }

  public async getAvailableModels(): Promise<Model[]> {
    const models: Model[] = [];
    // TODO: Load models from providers
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
      console.error(`Model ${modelId} not found`);
      return false;
    }

    this.currentModelId = modelId;
    // TODO: Save configuration to file system
    return true;
  }

  public async generateCommit(
    changeSummary: GitChangeSummary
  ): Promise<Result<CommitData, string>> {
    const currentModel = await this.getCurrentModel();
    if (!currentModel) {
      return err("No model selected");
    }

    const provider = this.providers.find(
      (p) => (p.constructor as any).id === currentModel.providerId
    );
    if (!provider) {
      return err(`Provider ${currentModel.providerId} not found`);
    }

    try {
      return await provider.generateCommit(changeSummary, currentModel, {
        lang: "en-US", // TODO: Make this configurable
      });
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }

  public registerProvider(provider: Provider): void {
    if (
      !this.providers.find(
        (p) => (p.constructor as any).id === (provider.constructor as any).id
      )
    ) {
      this.providers.push(provider);
    }
  }

  public unregisterProvider(providerId: string): void {
    const index = this.providers.findIndex(
      (p) => (p.constructor as any).id === providerId
    );
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
  }
}
