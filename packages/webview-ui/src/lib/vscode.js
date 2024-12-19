"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVSCodeAPI = getVSCodeAPI;
let vscodeApi;
function getVSCodeAPI() {
    if (!vscodeApi) {
        vscodeApi = acquireVsCodeApi();
    }
    return vscodeApi;
}
