/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { IConfig } from "./core"

export interface ValidationResult {
  valid: boolean
  error?: string
  requiredConfig?: {
    key: string
    description: string
    type: "string" | "boolean" | "number"
    settingPath?: string
  }[]
}

export async function validateOpenaiApiKey(
  config: IConfig
): Promise<ValidationResult> {
  const apiKey = config.get("apiKeys.openai")

  if (!apiKey) {
    return {
      valid: false,
      error: "OpenAI API Key not configured",
      requiredConfig: [
        {
          key: "apiKeys.openai",
          description: "OpenAI API Key",
          type: "string",
          settingPath: "@ext:cs-magic.oh-my-commit apiKeys.openai",
        },
      ],
    }
  }

  try {
    // 验证 API Key 是否有效
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = (await response.json()) as {
        error?: { message?: string }
      }
      return {
        valid: false,
        error:
          errorData.error?.message ||
          `API validation failed: ${response.statusText}`,
      }
    }

    // 验证是否有 GPT-4 访问权限
    const modelsData = (await response.json()) as {
      data: Array<{ id: string }>
    }

    const hasGPT4Access = modelsData.data.some((model) =>
      model.id.startsWith("gpt-4")
    )

    if (!hasGPT4Access) {
      return {
        valid: false,
        error: "Your API key does not have access to GPT-4",
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during validation",
    }
  }
}
