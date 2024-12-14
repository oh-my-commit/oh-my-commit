import { Model } from "@/types/model";
import { GenerateCommitResult } from "@yaac/shared/types/commit";
import { DiffResult } from "simple-git";

export const presetAiProviders = [
  "openai",
  "anthropic",
  "deepseek",
  "zhipu",
  "groq",
];

export abstract class Provider {
  static id: string; // 提供者ID
  static displayName: string; // 提供者名称
  static description: string; // 提供者描述
  static enabled: boolean; // 是否启用
  static models: Model[];

  public abstract generateCommit(
    diff: DiffResult,
    model: Model,
    options?: { lang?: string }
  ): Promise<GenerateCommitResult>;
}
