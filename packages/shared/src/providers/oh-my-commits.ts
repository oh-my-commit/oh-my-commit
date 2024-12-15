import { ok, err } from "neverthrow";
import Anthropic from "@anthropic-ai/sdk";

import { Model } from "../types/model";
import { Provider } from "../types/provider";
import { GitChangeSummary } from "../types/git";
import { GenerateCommitResult } from "../types/commit";
import { BaseLogger } from "@/utils/BaseLogger";

import HttpsProxyAgent from "https-proxy-agent";
import { ToolUseBlock } from "@anthropic-ai/sdk/resources";
import { it } from "node:test";

class OhMyCommitsStandardModel implements Model {
  id = "omc/standard";
  name = "Oh My Commits Standard Model";
  description = "High accuracy commit messages using Claude 3.5 Sonnet";
  providerId = "oh-my-commits";
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  };
  aiProviderId = "anthropic";
}

export class OhMyCommitsProvider extends Provider {
  private anthropic: Anthropic | null = null;
  public config: any;

  static id = "oh-my-commits";
  static displayName = "Oh My Commits Provider";
  static description =
    "Commit message generation powered by Oh My Commits models";
  static enabled = true;
  static models = [new OhMyCommitsStandardModel()];

  constructor(logger?: BaseLogger, _apiKey?: string, proxyUrl?: string) {
    super();
    if (logger) this.logger = logger;

    this.config = {};

    const apiKey = _apiKey || process.env.ANTHROPIC_API_KEY;
    const proxy =
      proxyUrl ||
      process.env.HTTP_PROXY ||
      process.env.HTTPS_PROXY ||
      process.env.ALL_PROXY;

    const config: Record<string, any> = {
      apiKey,
      // baseURL: proxy,
    };

    if (proxy) {
      config["httpAgent"] = new HttpsProxyAgent.HttpsProxyAgent(proxy);
    }

    if (apiKey) {
      this.anthropic = new Anthropic(config);
    }
  }

  async generateCommit(
    diff: GitChangeSummary,
    _model: Model,
    options?: { lang?: string }
  ): Promise<GenerateCommitResult> {
    const lang = options?.lang || "en";
    if (!this.anthropic) {
      return err("Anthropic API key not configured");
    }

    try {
      const prompt = `You are a commit message generator. Your task is to analyze the git diff and generate a clear, descriptive commit message in ${lang} that strictly follows the conventional commits format.

Git diff:
${JSON.stringify(diff, null, 2)}

Please analyze the diff carefully and provide a commit message in the following JSON format:

{
  "title": "type(scope): description",  // Follow conventional commits format
  "body": "Detailed explanation",       // Explain WHAT and WHY
  "extra": {
    "type": "feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert",
    "scope": "optional component scope",
    "breaking": false,                  // Set to true if breaking change
    "issues": ["#123", "#456"]         // Related issue numbers if any
  }
}

Requirements:
1. Title format:
   - type: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert
   - scope: optional, in parentheses
   - description: imperative mood, no period
2. Keep title under 72 characters
3. Use imperative mood in description ("add" not "added")
4. Body should explain WHAT and WHY, not HOW
5. Wrap body at 72 characters
6. Use ${lang} for all text content
7. For breaking changes:
   - Add "!" after type/scope in title
   - Set breaking=true in extra
   
Example response:
{
  "title": "feat(auth): add Google OAuth login",
  "body": "Implement Google OAuth to provide users with single sign-on capability\\n\\nThis change:\\n- Adds Google OAuth integration\\n- Simplifies login process for users\\n- Improves security with 2FA support",
  "extra": {
    "type": "feat",
    "scope": "auth",
    "breaking": false,
    "issues": []
  }
}`;

      const messages = [
        {
          role: "user" as const,
          content: prompt,
        },
      ];

      this.logger.info("Generating commit message using Anthropic...");

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.7,
        messages,
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

      this.logger.debug(
        "Commit message generated (resonse): ",
        JSON.stringify(response)
      );

      try {
        if (!response.content[0] || response.content[0].type !== "tool_use") {
          throw new Error("Invalid response format");
        }

        const result = response.content.find(
          (c) => c.type === "tool_use" && c.name === "generate_commit"
          // @ts-ignore
        )!.input;
        const data = {
          title: result.title,
          body: result.body,
          meta: {
            model: "claude-3-sonnet-20240229",
            timestamp: new Date().toISOString(),
            provider: "oh-my-commits",
            ...result.extra,
          },
        };
        this.logger.info(
          "Commit message generated (data): ",
          JSON.stringify(data, null, 2)
        );
        return ok(data);
      } catch (e) {
        this.logger.error("Failed to parse tool response:", e);
        return err("Invalid tool response from AI model");
      }
    } catch (error) {
      this.logger.error("Failed to generate commit message:", error);
      return err(error instanceof Error ? error.message : "Unknown error");
    }
  }
}
