import {Solution} from "@/types/solution";
import { CommitGenerationResult, Provider,} from "../types/provider";

class OpenAIGPT4Solution implements Solution {
  id = "openai-gpt4";
  name = "GPT-4";
  description = "High accuracy commit messages using GPT-4";
  providerId = "openai";
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  };
  aiProviderId = "openai" ;
}

class OpenAIGPT35Solution implements Solution {
  id = "openai-gpt35";
  name = "GPT-3.5 Turbo";
  description = "Fast and efficient commit messages using GPT-3.5";
  providerId = "openai";
  metrics = {
    accuracy: 0.85,
    speed: 0.9,
    cost: 0.4,
  };
  aiProviderId = "openai"
}

export class OpenAIProvider implements Provider {
  id = "openai";
  name = "OpenAI Provider";
  description = "Commit message generation powered by OpenAI models";
  enabled = true;

  solutions = [new OpenAIGPT4Solution(), new OpenAIGPT35Solution()];

  async generateCommit(
    diff: string,
    solution: Solution
  ): Promise<CommitGenerationResult> {

    try {
      console.log(
        `Generating commit message using ${
          solution.name
        } for diff: ${diff.substring(0, 100)}...`
      );
      // TODO: 实现与 OpenAI API 的集成
      return {
        message: `feat: implement ${solution.name} commit message generation`,
      };
    } catch (error) {
      return {
        message: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
