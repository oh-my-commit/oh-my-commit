import * as vscode from "vscode";

export class Logger {
  private name: string;
  private output: vscode.OutputChannel;

  constructor(name: string) {
    this.name = name;
    this.output = vscode.window.createOutputChannel(`Oh My Commit - ${name}`);
  }

  info(message: string): void {
    this.log("INFO", message);
  }

  warn(message: string): void {
    this.log("WARN", message);
  }

  error(message: string): void {
    this.log("ERROR", message);
  }

  debug(message: string): void {
    this.log("DEBUG", message);
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    this.output.appendLine(`[${timestamp}] [${level}] [${this.name}] ${message}`);
  }

  dispose(): void {
    this.output.dispose();
  }
}
