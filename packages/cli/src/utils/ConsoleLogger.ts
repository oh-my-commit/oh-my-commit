import { BaseLogger } from "@oh-my-commit/shared";

export class ConsoleLogger implements BaseLogger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [${this.name}] ${message}`);
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
}
