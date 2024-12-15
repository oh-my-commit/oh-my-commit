import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ShellCommandOptions {
  cwd?: string;
  mode?: string;
  lang?: string;
  team?: boolean;
  debug?: boolean;
}

export class ShellExecutor {
  private static logger: vscode.LogOutputChannel;

  static setLogger(logger: vscode.LogOutputChannel) {
    ShellExecutor.logger = logger;
  }

  static async execute(command: string, options: ShellCommandOptions = {}): Promise<string> {
    const { cwd = vscode.workspace.rootPath } = options;
    
    // Build command with options
    let fullCommand = command;
    if (options.mode) fullCommand += ` --mode ${options.mode}`;
    if (options.lang) fullCommand += ` --lang ${options.lang}`;
    if (options.team) fullCommand += ' --team';
    if (options.debug) fullCommand += ' --debug';

    try {
      ShellExecutor.logger?.info(`Executing command: ${fullCommand}`);
      const { stdout, stderr } = await execAsync(fullCommand, { cwd });
      
      if (stderr) {
        ShellExecutor.logger?.warn(`Command stderr: ${stderr}`);
      }
      
      return stdout.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      ShellExecutor.logger?.error(`Command execution failed: ${message}`);
      throw error;
    }
  }

  // Convenience methods for common commands
  static async commit(): Promise<string> {
    return this.execute('omc');
  }

  static async init(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-init', options);
  }

  static async generate(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-gen', options);
  }

  static async check(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-check', options);
  }

  static async useConventional(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-conventional', options);
  }

  static async useSimple(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-simple', options);
  }

  static async useEnglish(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-en', options);
  }

  static async useChinese(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-zh', options);
  }

  static async teamMode(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-team', options);
  }

  static async teamInit(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-team-init', options);
  }

  static async teamCheck(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-team-check', options);
  }

  static async debug(options?: ShellCommandOptions): Promise<string> {
    return this.execute('omc-debug', options);
  }
}
