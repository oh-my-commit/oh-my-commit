"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientPush = void 0;
const getVSCodeAPI_1 = require("./lib/getVSCodeAPI");
const clientPush = (message) => {
    // vscodeClientLogger.info(message);
    const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
    vscode.postMessage(message);
};
exports.clientPush = clientPush;
