"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vscodeClientLogger = exports.VscodeClientLogger = void 0;
const clientPush_1 = require("@/clientPush");
const common_1 = require("@shared/common");
class VscodeClientLogger extends common_1.BaseLogger {
    channel = "default";
    constructor(channel) {
        super(channel);
    }
    log(level, ...args) {
        const rawMessage = (0, common_1.formatMessage)(...args);
        (0, clientPush_1.clientPush)({
            channel: this.channel,
            type: "log",
            data: {
                level,
                rawMessage,
            },
        });
    }
}
exports.VscodeClientLogger = VscodeClientLogger;
exports.vscodeClientLogger = new VscodeClientLogger("Webview Default");
