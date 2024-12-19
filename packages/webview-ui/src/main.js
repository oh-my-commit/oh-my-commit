"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const webview_ui_toolkit_1 = require("@vscode/webview-ui-toolkit");
const jotai_1 = require("jotai");
const client_1 = require("react-dom/client");
const commit_page_1 = require("./pages/commit.page");
require("@vscode/codicons/dist/codicon.css");
require("./styles/global.css");
require("./styles/markdown.css");
// 注册 VSCode Design System
(0, webview_ui_toolkit_1.provideVSCodeDesignSystem)().register((0, webview_ui_toolkit_1.vsCodeProgressRing)());
const container = document.getElementById("root");
if (!container) {
    console.error("Root element not found");
    throw new Error("Root element not found");
}
const root = (0, client_1.createRoot)(container);
root.render(
// <React.StrictMode>
(0, jsx_runtime_1.jsx)(jotai_1.Provider, { children: (0, jsx_runtime_1.jsx)(commit_page_1.CommitPage, {}) }));
