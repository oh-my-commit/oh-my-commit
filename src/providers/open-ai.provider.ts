import {Solution, ValidationResult} from "@/types/solution";
import {
  Provider,
  CommitGenerationResult,

} from "../types/provider";
import * as vscode from "vscode";

async function validate(): Promise<ValidationResult> {
  const apiKey = vscode.workspace
    .getConfiguration("yaac")
    .get<string>("apiKeys.openai");

  if (!apiKey) {
    return {
      valid: false,
      error: "OpenAI API Key not configured",
      requiredConfig: [
        {
          key: "apiKeys.openai",
          description: "OpenAI API Key",
          type: "string",
          settingPath: "@ext:cs-magic.yaac apiKeys.openai",
        },
      ],
    };
  }

  try {
    // 验证 API Key 是否有效
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: { message?: string } };
      return {
        valid: false,
        error: errorData.error?.message || `API validation failed: ${response.statusText}`,
      };
    }

    // 验证是否有 GPT-4 访问权限
    const modelsData = (await response.json()) as {
      data: Array<{ id: string }>;
    };
    
    const hasGPT4Access = modelsData.data.some((model) =>
      model.id.startsWith("gpt-4")
    );

    if (!hasGPT4Access) {
      return {
        valid: false,
        error: "Your API key does not have access to GPT-4",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during validation",
    };
  }
}

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
  validate = validate;
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
  validate = validate;
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
    // 在生成之前先验证
    const validationResult = await solution.validate();
    if (!validationResult.valid) {
      return {
        message: "",
        error: validationResult.error,
      };
    }

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
