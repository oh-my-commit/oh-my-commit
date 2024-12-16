import { getVSCodeAPI } from "./storage";
class Logger {
    constructor() {
        this.vscode = getVSCodeAPI();
        this.channel = "default";
    }
    formatMessage(...args) {
        return args
            .map((arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))
            .join(" ");
    }
    log(level, ...args) {
        const rawMessage = this.formatMessage(...args);
        this.vscode.postMessage({
            command: "log",
            payload: {
                channel: this.channel,
                level,
                rawMessage,
                sourceInfo: {
                    isDevelopment: process.env.NODE_ENV === "development",
                },
            },
        });
    }
    debug(...args) {
        this.log("debug", ...args);
    }
    info(...args) {
        this.log("info", ...args);
    }
    warn(...args) {
        this.log("warn", ...args);
    }
    error(...args) {
        this.log("error", ...args);
    }
    trace(...args) {
        this.log("trace", ...args);
    }
    setChannel(channel) {
        this.channel = channel;
        this.info(`Logger channel set to: ${channel}`);
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map