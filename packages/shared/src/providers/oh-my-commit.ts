import { Result, ok } from "neverthrow";
import { Model } from "../types/model";
import { CommitData } from "../types/commit";
import { GitChangeSummary } from "../types/git";
import { Provider } from "../types/provider";

export class OhMyCommitStandardModel implements Model {
  id = "omc/standard";
  name = "Standard";
  description = "Standard commit message format";
  providerId = "oh-my-commit";
}

export class OhMyCommitProvider implements Provider {
  public config: any = {};
  public logger: any = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  static models = [new OhMyCommitStandardModel()];

  async generateCommit(
    diff: GitChangeSummary,
    _model: Model,
    _options?: { lang?: string }
  ): Promise<Result<CommitData, string>> {
    const files = diff.files
      .map((file) => `${file.status} ${file.path}`)
      .join("\n");

    // Basic commit message generation without AI
    const title = `chore: update ${diff.files.length} files`;
    const body = `Files changed:\n${files}`;

    return ok({ title, body });
  }
}
