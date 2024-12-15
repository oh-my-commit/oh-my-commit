import { Model } from "@/types/model";
import { Loggable } from "@/types/mixins";
import { GenerateCommitResult } from "@oh-my-commit/shared/types/commit";
import { GitChangeSummary } from "@oh-my-commit/shared";
import { workspace, WorkspaceConfiguration } from "vscode";

export const presetAiProviders = [
  "openai",
  "anthropic",
  "deepseek",
  "zhipu",
  "groq",
];

export abstract class Provider extends Loggable(class {}) {
  static id: string; // 提供者ID
  static displayName: string; // 提供者名称
  static description: string; // 提供者描述
  static enabled: boolean = true; // 是否启用
  static models: Model[] = []; // 支持的模型列表

  abstract generateCommit(
    diff: GitChangeSummary,
    model: Model,
    options?: { lang?: string }
  ): Promise<GenerateCommitResult>;

  protected get config(): WorkspaceConfiguration {
    return workspace.getConfiguration("");
  }
}
