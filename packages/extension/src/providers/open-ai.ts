import { Model } from "@/types/model";
import { GenerateCommitResult } from "@yaac/shared/types/commit";
import { Ok } from "neverthrow";
import { DiffResult } from "simple-git";
import { Provider } from "../types/provider";

class OpenAIGPT4Model implements Model {
  id = "openai/gpt-4";
  name = "OpenAI / GPT 4";
  description = "High accuracy commit messages using GPT-4";
  providerId = "openai";
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  };
  aiProviderId = "openai";
}

class OpenAIGPT35Model implements Model {
  id = "openai/gpt-3.5";
  name = "OpenAI / GPT 3.5 Turbo";
  description = "Fast and efficient commit messages using GPT-3.5";
  providerId = "openai";
  metrics = {
    accuracy: 0.85,
    speed: 0.9,
    cost: 0.4,
  };
  aiProviderId = "openai";
}

export class OpenAIProvider implements Provider {
  id = "openai";
  name = "OpenAI Provider";
  description = "Commit message generation powered by OpenAI models";
  enabled = true;

  models = [new OpenAIGPT4Model(), new OpenAIGPT35Model()];

  async generateCommit(
    diff: DiffResult,
    model: Model,
  ): Promise<GenerateCommitResult> {
    console.log("-- diff: ", diff);

    // TODO: 实现与 OpenAI API 的集成
    return new Ok({
      title: `feat: implement ${model.name} commit message generation`,
      body: "- xxx\n- yyy\n- zzz",
    });
  }
}
