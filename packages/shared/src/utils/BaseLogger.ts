export interface BaseLogger {
  info(...message: any[]): void;
  warn(...message: any[]): void;
  error(...message: any[]): void;
  debug(...message: any[]): void;
}
