import { CommitService, CommitChanges, CommitMessage } from "../../types";
import { workspace } from "vscode";
import * as path from "path";
import { GcopConfig } from "./types";
import { SUPPORTED_MODELS, SupportedModel } from "./models";
import { ModelAdapter } from "./modelAdapter";
import { exec } from "child_process";
import { promisify } from "util";
import * as yaml from "yaml";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

export class GcopService implements CommitService {
  readonly name = "GCOP";
  readonly description = "基于 Python 的高性能提交信息生成服务";

  constructor(private modelName: SupportedModel) {
    const model = SUPPORTED_MODELS[modelName];
    if (!model) {
      throw new Error(`Unsupported model: ${modelName}`);
    }
  }

  get metrics() {
    return SUPPORTED_MODELS[this.modelName].metrics;
  }

  private async ensureGcopInstalled(): Promise<void> {
    try {
      await execAsync("gcop --version");
    } catch (error) {
      throw new Error(
        "gcop is not installed. Please install it using: pip install gcop"
      );
    }
  }

  private async writeConfig(config: GcopConfig): Promise<void> {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) {
      throw new Error("Cannot find home directory");
    }

    const configDir = path.join(homeDir, ".config", "gcop");
    const configPath = path.join(configDir, "config.yaml");

    try {
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(configPath, yaml.stringify(config));
    } catch (error) {
      throw new Error(`Failed to write gcop config: ${error}`);
    }
  }

  private async getConfig(): Promise<GcopConfig> {
    const config = workspace.getConfiguration("yaac.gcop");
    const provider = ModelAdapter.getProviderFromModelName(this.modelName);

    // 从环境变量获取 API 密钥和基础 URL
    const apiKey = process.env[ModelAdapter.getApiKeyName(provider)];
    if (!apiKey && provider !== "ollama") {
      throw new Error(
        `Environment variable ${ModelAdapter.getApiKeyName(provider)} not set`
      );
    }

    const apiBase =
      process.env[ModelAdapter.getApiBaseName(provider)] ||
      ModelAdapter.getDefaultBase(provider);

    return {
      model: {
        model_name: ModelAdapter.adaptModelName(this.modelName),
        api_key: apiKey || "",
        api_base: apiBase,
      },
      include_git_history: config.get<boolean>("includeGitHistory") || false,
      enable_data_improvement:
        config.get<boolean>("enableDataImprovement") || false,
      commit_template: config.get<string>("commitTemplate") || "",
    };
  }

  async generateCommitMessage(_changes: CommitChanges): Promise<CommitMessage> {
    try {
      await this.ensureGcopInstalled();
      const config = await this.getConfig();
      await this.writeConfig(config);

      // 调用 gcop 命令生成提交信息
      const { stdout, stderr } = await execAsync("gcop commit");
      if (stderr) {
        console.warn("gcop warning:", stderr);
      }

      // 解析 gcop 输出
      const lines = stdout.trim().split("\n");
      const type = lines[0].split(":")[0];
      const subject = lines[0].split(":")[1].trim();
      const body = lines.slice(2).join("\n");

      return {
        type,
        subject,
        body,
        breaking: stdout.toLowerCase().includes("breaking change"),
      };
    } catch (error) {
      console.error("Failed to generate commit message:", error);
      throw new Error("Failed to generate commit message using gcop service");
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.ensureGcopInstalled();
      const config = await this.getConfig();
      await this.writeConfig(config);
      return true;
    } catch (error) {
      console.error("Invalid gcop configuration:", error);
      return false;
    }
  }
}
