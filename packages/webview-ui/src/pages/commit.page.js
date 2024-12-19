"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clientPush_1 = require("@/clientPush");
const CommitMessage_1 = require("@/components/commit/CommitMessage");
const FileChanges_1 = require("@/components/commit/file-changes/FileChanges");
const footer_1 = require("@/components/footer");
const use_close_window_1 = require("@/hooks/use-close-window");
const vscode_client_logger_1 = require("@/lib/vscode-client-logger");
const commit_changed_files_1 = require("@/state/atoms/commit.changed-files");
const commit_message_1 = require("@/state/atoms/commit.message");
const jotai_1 = require("jotai");
const react_1 = require("react");
const CommitPage = () => {
    const setTitle = (0, jotai_1.useSetAtom)(commit_message_1.commitTitleAtom);
    const setBody = (0, jotai_1.useSetAtom)(commit_message_1.commitBodyAtom);
    const setDiffResult = (0, jotai_1.useSetAtom)(commit_changed_files_1.diffResultAtom);
    (0, use_close_window_1.useCloseWindow)();
    (0, react_1.useEffect)(() => {
        (0, clientPush_1.clientPush)({ type: "init", channel: "CommitPage" });
    }, []);
    (0, react_1.useEffect)(() => {
        vscode_client_logger_1.vscodeClientLogger.info("[useEffect] Setting up message event listener");
        const handleMessage = (event) => {
            const message = event.data;
            if (!message || !("type" in message)) {
                vscode_client_logger_1.vscodeClientLogger.info("Unknown event:", message);
                return;
            }
            switch (message.type) {
                case "diff-result":
                    setDiffResult(message.data);
                    break;
                case "commit-message":
                    if (message.data.ok) {
                        setTitle(message.data.data.title);
                        setBody(message.data.data.body ?? "");
                    }
                    break;
                case "commit-result":
                    break;
                case "pong":
                    break;
                default:
                    vscode_client_logger_1.vscodeClientLogger.info("Unknown event:", message);
                    return;
            }
        };
        window.addEventListener("message", handleMessage);
        // 清理函数
        return () => {
            vscode_client_logger_1.vscodeClientLogger.info("[useEffect] Removing message event listener");
            window.removeEventListener("message", handleMessage);
        };
    }, []);
    vscode_client_logger_1.vscodeClientLogger.setChannel("CommitPage");
    vscode_client_logger_1.vscodeClientLogger.info("== rendered ==");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-screen", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-auto", children: [(0, jsx_runtime_1.jsx)(CommitMessage_1.CommitMessage, {}), (0, jsx_runtime_1.jsx)(FileChanges_1.FileChanges, {})] }), (0, jsx_runtime_1.jsx)(footer_1.Footer, {})] }));
};
exports.CommitPage = CommitPage;
