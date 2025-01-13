/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Anthropic } from "@anthropic-ai/sdk"
import type { Message } from "@anthropic-ai/sdk/resources"
import fs from "fs"
import Handlebars, { TemplateDelegate } from "handlebars"
import { HttpsProxyAgent } from "https-proxy-agent"
import { merge } from "lodash-es"
import path from "path"

import {
  APP_ID_CAMEL,
  APP_NAME,
  BaseProvider,
  IError,
  type IInput,
  type IModel,
  type IProvider,
  type IResultDTO,
  type ProviderContext,
  formatError,
} from "@shared/common"

class StandardModel implements IModel {
  id = `omc-standard`
  name = `omc-standard`
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
    homepage: "https://github.com/oh-my-commit/oh-my-commits",
    repository: "https://github.com/oh-my-commit/oh-my-commits",
  }

  private anthropic: Anthropic | null = null
  private template: TemplateDelegate

  constructor(context: ProviderContext) {
    super(context)

    const prompt = fs.readFileSync(path.join(__dirname, "standard.hbs"), "utf-8")
    this.template = Handlebars.compile(prompt)
  }

  async generateCommit(input: IInput): Promise<IResultDTO> {
    this.logger.debug("Generating commit message using OMC Provider...")
    const diff = input.diff
    const lang = input.options?.lang || "en"

    try {
      const prompt = this.template({ diff, lang })
      const response = await this.callApi(prompt)
      const result = await this.handleApiResult(response)

      merge(result.meta, {
        generatedAt: new Date().toISOString(),
        modelId: input.model,
        providerId: this.id,
      })

      return {
        ok: true,
        data: result,
      }
    } catch (error: unknown) {
      if (error instanceof IError) {
        return {
          ok: false,
          code: error.code,
          message: error.message,
        }
      }
      // this.logger.error("Failed to generate commit:", error)
      return {
        ok: false,
        code: -999,
        message: formatError(error),
      }
    }
  }

  private callApi(prompt: string) {
    this.logger.debug("Generating commit message using Anthropic...")

    this.logger.debug("Initializing Anthropic API...")
    const proxyEnabled = this.config.get<boolean>("ohMyCommit.proxy.enabled")
    const proxyUrl = this.config.get<string | undefined>("ohMyCommit.proxy.url")
    const apiKey = this.config.get<string | undefined>("ohMyCommit.apiKeys.anthropic")

    const config: Record<string, any> = { apiKey }
    if (proxyEnabled && proxyUrl) config["httpAgent"] = new HttpsProxyAgent(proxyUrl)
    this.anthropic = new Anthropic(config)

    // comparison table: [Models - Anthropic](https://docs.anthropic.com/en/docs/about-claude/models)
    // const modelName = "claude-3-sonnet-20240229"
    const modelName = "claude-3-haiku-20240307"
    this.logger.debug("calling anthropic: ", { proxyEnabled, proxyUrl, apiKey, modelName })
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
    if (!item) throw new IError(-101, "Invalid tool response from AI model")

    if (item.type !== "tool_use") throw new IError(-102, "Invalid tool response from AI model")

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

    if (!result) throw new IError(-103, "Invalid tool response from AI model")

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
