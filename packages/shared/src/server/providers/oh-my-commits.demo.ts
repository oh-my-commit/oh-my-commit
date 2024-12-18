import { APP_ID, APP_NAME, OmcStandardModelId } from "@/common/constants";
import { CommitData, GenerateCommitResult } from "@/common/types/commit";
import { Model } from "@/common/types/model";
import { Provider } from "@/common/types/provider";
import { BaseLogger } from "@/common/utils/logger";
import Anthropic from "@anthropic-ai/sdk";
import { HttpsProxyAgent } from "https-proxy-agent";
import { err, ok, ResultAsync } from "neverthrow";
import { DiffResult } from "simple-git";

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

  override generateCommit(
    diff: DiffResult,
    model: Model,
    options?: {
      lang?: string;
    }
  ): ResultAsync<CommitData, Error> {
    return ResultAsync.fromPromise(
      (async () => {

        ...

        if (!result) throw new Error("Invalid tool response from AI model");

        return {
          title: result.title,
          body: result.body,
          ...
        };
      })(),
      (error: unknown) =>
        new Error(
          error instanceof Error ? error.message : "Unknown error occurred"
        )
    );
  }
}
