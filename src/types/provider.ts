import {Solution} from "@/types/solution";

export interface CommitGenerationResult {
  message: string;
  error?: string;
}

export interface Provider {
  id: string; // 提供者ID
  name: string; // 提供者名称
  description: string; // 提供者描述
  enabled: boolean; // 是否启用
  solutions: Solution[];

  generateCommit(
    diff: string,
    solution: Solution
  ): Promise<CommitGenerationResult>;
}
