import { ok, err } from "neverthrow";
import Anthropic from "@anthropic-ai/sdk";

import { Model } from "../types/model";
import { Provider } from "../types/provider";
import { GitChangeSummary } from "../types/git";
import { GenerateCommitResult } from "../types/commit";
import { BaseLogger } from "@/utils/BaseLogger";

import HttpsProxyAgent from "https-proxy-agent";

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

Requirements:
1. Title MUST follow format: <type>[optional scope]: <description>
   - type: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert
   - scope: optional, in parentheses, e.g., (core)
   - description: imperative mood, no period
2. Keep title under 72 characters
3. Use imperative mood ("add" not "added" or "adds")
4. Body should explain WHAT and WHY, not HOW
5. Wrap body at 72 characters
6. Use ${lang} for all text content
7. Breaking changes MUST be indicated by "!" after type/scope
   Example: feat(api)!: remove user endpoints

Example formats:
feat(auth): add Google OAuth login
fix(db): resolve connection timeout issues
refactor!: drop support for Node 6

Please analyze the diff carefully and provide:
1. A concise title line following the format above
2. A blank line
3. A detailed body explaining what changes were made and why`;

      const messages = [
        {
          role: "user" as const,
          content: prompt,
        },
      ];

      this.logger.info(
        "Generating commit message using Anthropic..."
        // JSON.stringify(messages, null, 2)
      );

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.7,
        messages,
      });

      this.logger.info("Commit message generated: ", response);

      const message =
        response.content[0].type === "text" ? response.content[0].text : "";
      const [title, ...bodyParts] = message.split("\n\n");

      return ok({
        title: title.trim(),
        body: bodyParts.join("\n\n").trim(),
      });
    } catch (error) {
      this.logger.error("Failed to generate commit message:", error);
      return err(error instanceof Error ? error.message : "Unknown error");
    }
  }
}
