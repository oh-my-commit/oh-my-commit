import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@anthropic-ai/sdk/resources";
import {
  APP_ID,
  APP_NAME,
  OmcStandardModelId,
} from "@oh-my-commit/shared/common/constants";
import { formatError } from "@oh-my-commit/shared/common/format-error";
import {
  BaseGenerateCommitProvider,
  GenerateCommitError,
  GenerateCommitInput,
  Model,
} from "@oh-my-commit/shared/common/types/provider";
import { BaseLogger } from "@oh-my-commit/shared/common/utils/logger";
import { TemplateManager } from "@oh-my-commit/shared/common/utils/template-manager";
import { getTemplatesDir } from "@oh-my-commit/shared/server/get-templates-dir";
import { HttpsProxyAgent } from "https-proxy-agent";
import { merge } from "lodash";
import { ResultAsync } from "neverthrow";

// 初始化模板管理器
const templateManager = TemplateManager.getInstance(getTemplatesDir());

class OmcStandardModel implements Model {
  id = OmcStandardModelId;
  name = `Standard Model`;
  description = "High accuracy commit messages using Claude 3.5 Sonnet";
  providerId = APP_ID;
  aiProviderId = "anthropic";
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  };
}

export class OmcProvider extends BaseGenerateCommitProvider {
  override id = APP_ID;
  override displayName = `${APP_NAME} Provider`;
  override description = `Commit message generation powered by ${APP_NAME} models`;
  override models = [new OmcStandardModel()];

  private anthropic: Anthropic | null = null;

  constructor(logger?: BaseLogger, _apiKey?: string, proxyUrl?: string) {
    super();
    if (logger) this.logger = logger;

    // this.config = {}; // todo: load from vscode configuration

    const apiKey = _apiKey || process.env.ANTHROPIC_API_KEY;
    const proxy =
      proxyUrl ||
      process.env.HTTP_PROXY ||
      process.env.HTTPS_PROXY ||
      process.env.ALL_PROXY;

    const config: Record<string, any> = { apiKey };

    if (proxy) config["httpAgent"] = new HttpsProxyAgent(proxy);

    if (apiKey) this.anthropic = new Anthropic(config);
  }

  override generateCommit(input: GenerateCommitInput) {
    this.logger.info("Generating commit message using OMC Provider...");
    return (
      // 1. call api
      ResultAsync.fromPromise(
        this.callApi(input),
        (error) =>
          new GenerateCommitError(
            -10086,
            `failed to call api, reason: ${formatError(error)}`,
          ),
      )
        // 2. handle api result
        .andThen((response) =>
          ResultAsync.fromPromise(
            this.handleApiResult(response),
            (error) =>
              new GenerateCommitError(
                -10087,
                `failed to handle api result, reason: ${formatError(error)}`,
              ),
          ),
        )
        // 3. add metadata
        .map((result) => {
          merge(result.meta, {
            generatedAt: new Date().toISOString(),
            modelId: input.model.id,
            providerId: this.id,
          });
          return result;
        })
    );
  }

  private callApi(input: GenerateCommitInput) {
    const lang = input.options?.lang || "en";
    const modelName = "claude-3-sonnet-20240229";
    if (!this.anthropic) throw new Error("Anthropic API key not configured");
    this.logger.info("Generating commit message using Anthropic...");

    const prompt = templateManager.render("commit-prompt", {
      diff: JSON.stringify(input.diff, null, 2),
    });

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
                description:
                  "Detailed explanation of what changes were made and why",
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
    });
  }

  private async handleApiResult(response: Message) {
    this.logger.debug(
      "Commit message generated (response): ",
      JSON.stringify(response),
    );

    const item = response.content[0];
    if (item.type !== "tool_use")
      throw new Error("Invalid tool response from AI model");

    const result = item.input as {
      title: string;
      body: string;
      extra?: {
        type?: string;
        scope?: string;
        breaking?: boolean;
        issues?: string[];
      };
    };

    if (!result) throw new Error("Invalid tool response from AI model");

    return {
      title: result.title,
      body: result.body,
      meta: {
        ...result.extra,
      },
    };
  }
}