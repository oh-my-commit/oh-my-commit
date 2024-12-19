import { APP_ID, APP_NAME, OmcStandardModelId } from "@/common/constants";
import { formatError } from "@/common/format-error";
import { GenerateCommitInput, Model, Provider } from "@/common/types/provider";
import { BaseLogger } from "@/common/utils/logger";
import { TemplateManager } from "@/common/utils/template-manager";
import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@anthropic-ai/sdk/resources";
import { HttpsProxyAgent } from "https-proxy-agent";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { join } from "path";
import { DiffResult } from "simple-git";

// 初始化模板管理器
const templateManager = TemplateManager.getInstance(
  join(__dirname, "..", "templates"),
);

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

export class OmcProvider extends Provider {
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

  private callApi(input: GenerateCommitInput) {
    return ResultAsync.fromPromise(
      (async () => {
        const lang = input.options?.lang || "en";
        const modelName = "claude-3-sonnet-20240229";
        if (!this.anthropic)
          throw new Error("Anthropic API key not configured");

        const prompt = templateManager.render("commit-prompt", {
          diff: JSON.stringify(input.diff, null, 2),
        });

        this.logger.info("Generating commit message using Anthropic...");

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
              description:
                "Generate a structured commit message based on git diff",
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
      })(),
      (error) => {
        return {
          ok: false,
          code: -1,
          message: `failed to call api, reason: ${formatError(error)}`,
        };
      },
    );
  }

  private handleApiResult(response: Message) {
    return ResultAsync.fromPromise(
      (async () => {
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
      })(),
      (error) => ({
        ok: false,
        message: `failed to handle api result, reason: ${formatError(error)}`,
        code: -2,
      }),
    );
  }

  override generateCommit(input: GenerateCommitInput) {
    return ResultAsync.fromSafePromise(Promise.resolve(input))
      .andThen((input) => this.callApi(input))
      .andThen((response) => this.handleApiResult(response));
  }
}
