import { Model } from "@/types/model";
import { CommitData } from "@yaac/shared/src/types/commit";
import { GenerateCommitResult } from "@yaac/shared/types/commit";
import { Result, Ok, Err } from "neverthrow";
import { DiffResult } from "simple-git";
import { Provider } from "../types/provider";
import Anthropic from "@anthropic-ai/sdk";

interface ExtendedDiffResult extends DiffResult {
  diff: string;
}

class YaacStandardModel implements Model {
  id = "yaac/standard";
  name = "YAAC / Standard";
  description = "High accuracy commit messages using Claude 3.5 Sonnet";
  providerId = "yaac";
  metrics = {
    accuracy: 0.95,
    speed: 0.7,
    cost: 0.8,
  };
  aiProviderId = "anthropic";
}

export class YaacProvider extends Provider {
  private anthropic: Anthropic | null = null;

  static id = "yaac";
  static displayName = "YAAC Provider";
  static description = "Commit message generation powered by YAAC models";
  static enabled = true;
  static models = [new YaacStandardModel()];

  constructor() {
    super();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  private async generateWithClaude(
    diff: ExtendedDiffResult,
    lang: string = "zh-CN"
  ): Promise<GenerateCommitResult> {
    if (!this.anthropic) {
      return new Err(
        new Error(
          "Claude API key not configured. Please set ANTHROPIC_API_KEY environment variable."
        )
      );
    }

    try {
      const prompt = `You are a commit message generator. Your task is to analyze the git diff and generate a clear, descriptive commit message in ${lang} that strictly follows the conventional commits format.

Git diff:
${diff.diff}

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

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: "assistant",
            content: prompt,
          },
        ],
      });

      const message =
        response.content[0].type === "text" ? response.content[0].text : "";
      const [title, ...bodyParts] = message.split("\n\n");

      const result: CommitData = {
        title: title.trim(),
        body: bodyParts.join("\n\n").trim(),
      };

      return new Ok(result);
    } catch (error) {
      return new Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  override async generateCommit(
    diff: DiffResult,
    model: Model,
    options?: { lang?: string }
  ): Promise<GenerateCommitResult> {
    switch (model.id) {
      case "yaac/standard":
        const result = await this.generateWithClaude(
          diff as ExtendedDiffResult,
          options?.lang
        );
        if (result.isErr()) {
          throw result.error;
        }
        return result;
      default:
        throw new Error(`Unsupported model: ${model.id}`);
    }
  }
}
