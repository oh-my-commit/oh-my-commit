declare class Logger {
    private vscode;
    private channel;
    private formatMessage;
    private log;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    trace(...args: any[]): void;
    setChannel(channel: string): void;
}
export declare const logger: Logger;
export {};
