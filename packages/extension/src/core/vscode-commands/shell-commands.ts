import * as vscode from "vscode";
import { BaseCommand } from "./types";
import { ShellExecutor, ShellCommandOptions } from "../shell-executor";

abstract class ShellCommand extends BaseCommand {
  protected async executeShell(command: () => Promise<string>): Promise<void> {
    try {
      const result = await command();
      this.logger?.info(`Command result: ${result}`);
      vscode.window.showInformationMessage(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger?.error(`Command failed: ${message}`);
      vscode.window.showErrorMessage(`Command failed: ${message}`);
    }
  }

  protected async getOptions(): Promise<ShellCommandOptions> {
    const config = vscode.workspace.getConfiguration("oh-my-commits");
    return {
      mode: config.get<string>("mode"),
      lang: config.get<string>("language"),
      team: config.get<boolean>("team"),
      debug: config.get<boolean>("debug"),
    };
  }
}

export class CommitCommand extends ShellCommand {
  id = "omc.commit";
  async execute(): Promise<void> {
    await this.executeShell(() => ShellExecutor.commit());
  }
}

export class InitCommand extends ShellCommand {
  id = "omc.init";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.init(await this.getOptions())
    );
  }
}

export class GenerateCommand extends ShellCommand {
  id = "omc.generate";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.generate(await this.getOptions())
    );
  }
}

export class CheckCommand extends ShellCommand {
  id = "omc.check";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.check(await this.getOptions())
    );
  }
}

export class UseConventionalCommand extends ShellCommand {
  id = "omc.useConventional";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.useConventional(await this.getOptions())
    );
  }
}

export class UseSimpleCommand extends ShellCommand {
  id = "omc.useSimple";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.useSimple(await this.getOptions())
    );
  }
}

export class UseEnglishCommand extends ShellCommand {
  id = "omc.useEnglish";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.useEnglish(await this.getOptions())
    );
  }
}

export class UseChineseCommand extends ShellCommand {
  id = "omc.useChinese";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.useChinese(await this.getOptions())
    );
  }
}

export class TeamModeCommand extends ShellCommand {
  id = "omc.teamMode";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.teamMode(await this.getOptions())
    );
  }
}

export class TeamInitCommand extends ShellCommand {
  id = "omc.teamInit";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.teamInit(await this.getOptions())
    );
  }
}

export class TeamCheckCommand extends ShellCommand {
  id = "omc.teamCheck";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.teamCheck(await this.getOptions())
    );
  }
}

export class DebugCommand extends ShellCommand {
  id = "omc.debug";
  async execute(): Promise<void> {
    await this.executeShell(async () =>
      ShellExecutor.debug(await this.getOptions())
    );
  }
}
