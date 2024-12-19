"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitMessage = CommitMessage;
const jsx_runtime_1 = require("react/jsx-runtime");
const clientPush_1 = require("@/clientPush");
const commit_format_tooltip_1 = require("@/components/commit/commit-format-tooltip");
const feedback_button_1 = require("@/components/commit/feedback-button");
const info_icon_1 = require("@/components/commit/info-icon");
const message_input_1 = require("@/components/commit/message-input");
const Section_1 = require("@/components/layout/Section");
const commit_changed_files_1 = require("@/state/atoms/commit.changed-files");
const commit_message_1 = require("@/state/atoms/commit.message");
const react_1 = require("@vscode/webview-ui-toolkit/react");
const jotai_1 = require("jotai");
const react_2 = require("react");
const MAX_SUBJECT_LENGTH = 72;
const MAX_DETAIL_LENGTH = 1000;
function CommitMessage() {
    const [title, setTitle] = (0, jotai_1.useAtom)(commit_message_1.commitTitleAtom);
    const [body, setBody] = (0, jotai_1.useAtom)(commit_message_1.commitBodyAtom);
    const [showTooltip, setShowTooltip] = (0, react_2.useState)(false);
    const [isRegenerating, setIsRegenerating] = (0, react_2.useState)(false);
    const [selectedFiles, setSelectedFiles] = (0, jotai_1.useAtom)(commit_changed_files_1.selectedFilesAtom);
    const tooltipContainerRef = (0, react_2.useRef)(null);
    const subjectLength = title.length;
    const isSubjectValid = subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;
    const disabled = !title.trim();
    (0, react_2.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (tooltipContainerRef.current &&
                !tooltipContainerRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // 处理重新生成
    const handleRegenerate = () => {
        setIsRegenerating(true);
        (0, clientPush_1.clientPush)({
            channel: "commitMesage",
            type: "selected-files",
            data: selectedFiles,
        });
    };
    return ((0, jsx_runtime_1.jsxs)(Section_1.Section, { title: "Commit Message", actions: (0, jsx_runtime_1.jsxs)("div", { className: "relative", ref: tooltipContainerRef, children: [(0, jsx_runtime_1.jsx)("button", { className: "flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150", onClick: () => setShowTooltip(!showTooltip), children: (0, jsx_runtime_1.jsx)(info_icon_1.InfoIcon, {}) }), showTooltip && (0, jsx_runtime_1.jsx)(commit_format_tooltip_1.CommitFormatTooltip, {})] }), children: [(0, jsx_runtime_1.jsxs)(Section_1.Section.Content, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-medium text-[var(--vscode-input-foreground)]", children: "Summary" }), (0, jsx_runtime_1.jsx)(message_input_1.MessageInput, { value: title, maxLength: MAX_SUBJECT_LENGTH, placeholder: "Write a brief description of your changes", onChange: setTitle, className: "h-[32px]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-medium text-[var(--vscode-input-foreground)]", children: "Details" }), (0, jsx_runtime_1.jsx)(message_input_1.MessageInput, { value: body, maxLength: MAX_DETAIL_LENGTH, placeholder: "Add a detailed description of your changes (optional)", onChange: setBody, className: "min-h-[120px]", multiline: true })] })] }), (0, jsx_runtime_1.jsxs)(Section_1.Section.Footer, { children: [!isSubjectValid && subjectLength > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] text-[var(--vscode-errorForeground)]", children: ["Subject must be \u2264 ", MAX_SUBJECT_LENGTH, " characters"] })), (0, jsx_runtime_1.jsx)(feedback_button_1.FeedbackButton, { onFeedback: () => {
                            // todo: feedback
                        }, disabled: disabled }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 shrink-0", children: [(0, jsx_runtime_1.jsx)(react_1.VSCodeButton, { className: "w-32 shrink-0 overflow-hidden", appearance: "secondary", disabled: isRegenerating, onClick: handleRegenerate, children: isRegenerating ? ((0, jsx_runtime_1.jsx)("span", { className: "w-full flex items-center gap-2", children: (0, jsx_runtime_1.jsx)("vscode-progress-ring", { style: {
                                            width: "16px",
                                            height: "16px",
                                            "--vscode-progressBar-background": "var(--vscode-button-foreground)",
                                        } }) })) : ("Regenerate") }), (0, jsx_runtime_1.jsx)(react_1.VSCodeButton, { disabled: !isSubjectValid || disabled, onClick: () => {
                                    // todo: commit
                                }, children: "Commit Changes" })] })] })] }));
}
