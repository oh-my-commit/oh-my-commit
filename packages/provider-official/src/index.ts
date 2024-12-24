import { Anthropic } from "@anthropic-ai/sdk"
import type { Message } from "@anthropic-ai/sdk/resources"

import {
  APP_ID_CAMEL,
  APP_ID_DASH,
  APP_NAME,
  BaseProvider,
  formatError,
  GenerateCommitError,
  type GenerateCommitInput,
  type GenerateCommitResult,
  type IModel,
  type IProvider,
  type ProviderContext,
} from "@shared/common"
import { PromptTemplate } from "@shared/server/prompt-template"
import { HttpsProxyAgent } from "https-proxy-agent"
import { merge } from "lodash-es"
import { ResultAsync } from "neverthrow"

class StandardModel implements IModel {
  id = `${APP_ID_DASH}.standard`
  name = `${APP_NAME} Standard Model`
  description = "High accuracy commit messages using Claude 3.5 Sonnet"
  providerId = APP_ID_CAMEL
  aiProviderId = "anthropic"
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  }
}

class OfficialProvider extends BaseProvider implements IProvider {
  id = APP_ID_CAMEL
  displayName = `${APP_NAME} Provider`
  description = `Commit message generation powered by ${APP_NAME} models`
  models = [new StandardModel()]
  metadata = {
    version: "0.1.0",
    author: "CS Magic",
    homepage: "https://github.com/cs-magic-open/oh-my-commits",
    repository: "https://github.com/cs-magic-open/oh-my-commits",
  }

  private anthropic: Anthropic | null = null
  private templateProcessor = new PromptTemplate("provider-official/standard")

  constructor(context: ProviderContext) {
    super(context)

    this.logger.info("Initializing Anthropic API...")
    const proxy = this.config.get<string | undefined>("proxy")
    const apiKey = this.config.get<string | undefined>("apiKeys.anthropic")

    const config: Record<string, any> = { apiKey }
    if (proxy) config["httpAgent"] = new HttpsProxyAgent(proxy)
    this.logger.info("Initializing Anthropic API: ", config)
    this.anthropic = new Anthropic(config)
  }

  generateCommit(
    input: GenerateCommitInput,
  ): ResultAsync<GenerateCommitResult, GenerateCommitError> {
    this.logger.info("Generating commit message using OMC Provider...")
    const diff = JSON.stringify(input.diff, null, 2)
    const lang = input.options?.lang || "en"

    return ResultAsync.fromPromise(
      Promise.resolve().then(() => this.templateProcessor.fill({ diff, lang })),
      error =>
        new GenerateCommitError(-10085, `failed to load prompt, reason: ${formatError(error)}`),
    )
      .andThen(prompt =>
        ResultAsync.fromPromise(
          this.callApi(prompt),
          error =>
            new GenerateCommitError(-10086, `failed to call api, reason: ${formatError(error)}`),
        ),
      )
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
      .map(result => {
        merge(result.meta, {
          generatedAt: new Date().toISOString(),
          modelId: input.model,
          providerId: this.id,
        })
        return result
      })
  }

  private callApi(prompt: string) {
    this.logger.info("Generating commit message using Anthropic...")
    const modelName = "claude-3-sonnet-20240229"
    if (!this.anthropic) throw new Error("Anthropic API key not configured")

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
    if (!item) throw new Error("Invalid tool response from AI model")

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

export default OfficialProvider
