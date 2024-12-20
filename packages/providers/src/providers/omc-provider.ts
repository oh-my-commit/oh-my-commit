import type { ICommitProvider } from "@/index"
import Anthropic from "@anthropic-ai/sdk"
import type { Message } from "@anthropic-ai/sdk/resources"
import {
  APP_ID,
  APP_NAME,
  BaseGenerateCommitProvider,
  type BaseLogger,
  formatError,
  GenerateCommitError,
  type GenerateCommitInput,
  type Model,
  OmcStandardModelId,
} from "@shared/common"
import { HttpsProxyAgent } from "https-proxy-agent"
import { merge } from "lodash-es"
import { ResultAsync } from "neverthrow"

export const loadPrompt = (lang: string, diff: string) => {
  // todo: parse from `commit-prompt.hbs`
  return `作为一个经验丰富的开发者，请分析以下代码变更并生成提交信息：\n${diff}`
}

class OmcStandardModel implements Model {
  id = OmcStandardModelId
  name = `Standard Model`
  description = "High accuracy commit messages using Claude 3.5 Sonnet"
  providerId = APP_ID
  aiProviderId = "anthropic"
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  }
}

export class OmcProvider extends BaseGenerateCommitProvider implements ICommitProvider {
  id = APP_ID
  displayName = `${APP_NAME} Provider`
  description = `Commit message generation powered by ${APP_NAME} models`
  models = [new OmcStandardModel()]
  metadata = {
    version: "1.0.0",
    author: "Your Name",
    homepage: "https://your-homepage.com",
    repository: "https://your-repo.com",
  }

  private anthropic: Anthropic | null = null

  constructor(logger?: BaseLogger, _apiKey?: string, proxyUrl?: string) {
    super()
    if (logger) {
      this.logger = logger
    }

    const apiKey = _apiKey || process.env.ANTHROPIC_API_KEY
    const proxy =
      proxyUrl || process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.ALL_PROXY

    const config: Record<string, any> = { apiKey }

    if (proxy) config["httpAgent"] = new HttpsProxyAgent(proxy)

    if (apiKey) this.anthropic = new Anthropic(config)
  }

  generateCommit(input: GenerateCommitInput) {
    this.logger.info("Generating commit message using OMC Provider...")
    return (
      // 1. call api
      ResultAsync.fromPromise(
        this.callApi(input),
        error =>
          new GenerateCommitError(-10086, `failed to call api, reason: ${formatError(error)}`),
      )
        // 2. handle api result
        .andThen(response =>
          ResultAsync.fromPromise(
            this.handleApiResult(response),
            error =>
              new GenerateCommitError(
                -10087,
                `failed to handle api result, reason: ${formatError(error)}`,
              ),
          ),
        )
        // 3. add metadata
        .map(result => {
          merge(result.meta, {
            generatedAt: new Date().toISOString(),
            modelId: input.model.id,
            providerId: this.id,
          })
          return result
        })
    )
  }

  private callApi(input: GenerateCommitInput) {
    const lang = input.options?.lang || "en"
    const modelName = "claude-3-sonnet-20240229"
    if (!this.anthropic) throw new Error("Anthropic API key not configured")
    this.logger.info("Generating commit message using Anthropic...")

    const diff = JSON.stringify(input.diff, null, 2)
    const prompt = loadPrompt(lang, diff)

    return this.anthropic.messages.create({
      model: modelName,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: [
        {
          name: "generate_commit",
          description: "Generate a structured commit message based on git diff",
          input_schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "Commit title following conventional commits format: <type>[optional scope]: <description>",
              },
              body: {
                type: "string",
                description: "Detailed explanation of what changes were made and why",
              },
              extra: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "feat",
                      "fix",
                      "docs",
                      "style",
                      "refactor",
                      "perf",
                      "test",
                      "chore",
                      "ci",
                      "build",
                      "revert",
                    ],
                    description: "Type of change",
                  },
                  scope: {
                    type: "string",
                    description: "Component scope of the change",
                  },
                  breaking: {
                    type: "boolean",
                    description: "Whether this is a breaking change",
                  },
                  issues: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description: "Related issue numbers",
                  },
                },
                required: ["type", "breaking", "issues"],
              },
            },
            required: ["title", "body", "extra"],
          },
        },
      ],
      tool_choice: { type: "tool" as const, name: "generate_commit" },
    })
  }

  private async handleApiResult(response: Message) {
    this.logger.debug("Commit message generated (response): ", JSON.stringify(response))

    const item = response.content[0]
    if (item.type !== "tool_use") throw new Error("Invalid tool response from AI model")

    const result = item.input as {
      title: string
      body: string
      extra?: {
        type?: string
        scope?: string
        breaking?: boolean
        issues?: string[]
      }
    }

    if (!result) throw new Error("Invalid tool response from AI model")

    return {
      title: result.title,
      body: result.body,
      meta: {
        ...result.extra,
      },
    }
  }
}
