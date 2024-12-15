import { BaseLogger } from "./BaseLogger";

export class ConsoleLogger implements BaseLogger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private log(level: string, ...message: any[]): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [${this.name}] ${message}`);
  }

  info(...message: any[]): void {
    this.log("INFO", message);
  }

  warn(...message: any[]): void {
    this.log("WARN", message);
  }

  error(...message: any[]): void {
    this.log("ERROR", message);
  }

  debug(...message: any[]): void {
    this.log("DEBUG", message);
  }
}
