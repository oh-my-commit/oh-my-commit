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

export interface Provider {
  id: string; // 提供者ID
  name: string; // 提供者名称
  description: string; // 提供者描述
  enabled: boolean; // 是否启用
  models: Model[];

  generateCommit(diff: DiffResult, model: Model): Promise<GenerateCommitResult>;
}
