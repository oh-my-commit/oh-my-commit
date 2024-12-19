import { BaseLogger, type LogLevel } from "@shared/common";
export declare class VscodeClientLogger extends BaseLogger {
    protected channel: string;
    constructor(channel: string);
    protected log(level: LogLevel, ...args: any[]): void;
}
export declare const vscodeClientLogger: VscodeClientLogger;
