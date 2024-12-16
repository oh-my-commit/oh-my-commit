import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CommitFormatTooltip } from "@/components/commit/commit-format-tooltip";
import { FeedbackButton } from "@/components/commit/feedback-button";
import { InfoIcon } from "@/components/commit/info-icon";
import { MessageInput } from "@/components/commit/message-input";
import { Section } from "@/components/layout/Section";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
const MAX_SUBJECT_LENGTH = 72;
const MAX_DETAIL_LENGTH = 1000;
export function CommitMessage({ onRegenerate }) {
    const [title, setTitle] = useAtom(commitTitleAtom);
    const [body, setBody] = useAtom(commitBodyAtom);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const tooltipContainerRef = useRef(null);
    const subjectLength = title.length;
    const isSubjectValid = subjectLength > 0 && subjectLength <= MAX_SUBJECT_LENGTH;
    const disabled = !title.trim();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipContainerRef.current &&
                !tooltipContainerRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        const messageHandler = (event) => {
            const message = event.data;
            if (message.type === "commit") {
                setIsRegenerating(false);
            }
        };
        window.addEventListener("message", messageHandler);
        return () => window.removeEventListener("message", messageHandler);
    }, []);
    return (_jsxs(Section, { title: "Commit Message", actions: _jsxs("div", { className: "relative", ref: tooltipContainerRef, children: [_jsx("button", { className: "flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150", onClick: () => setShowTooltip(!showTooltip), children: _jsx(InfoIcon, {}) }), showTooltip && _jsx(CommitFormatTooltip, {})] }), children: [_jsxs(Section.Content, { children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("div", { className: "text-xs font-medium text-[var(--vscode-input-foreground)]", children: "Summary" }), _jsx(MessageInput, { value: title, maxLength: MAX_SUBJECT_LENGTH, placeholder: "Write a brief description of your changes", onChange: setTitle, className: "h-[32px]" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("div", { className: "text-xs font-medium text-[var(--vscode-input-foreground)]", children: "Details" }), _jsx(MessageInput, { value: body, maxLength: MAX_DETAIL_LENGTH, placeholder: "Add a detailed description of your changes (optional)", onChange: setBody, className: "min-h-[120px]", multiline: true })] })] }), _jsxs(Section.Footer, { children: [!isSubjectValid && subjectLength > 0 && (_jsxs("span", { className: "text-[11px] text-[var(--vscode-errorForeground)]", children: ["Subject must be \u2264 ", MAX_SUBJECT_LENGTH, " characters"] })), _jsx(FeedbackButton, { onFeedback: () => {
                            // todo: feedback
                        }, disabled: disabled }), _jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [_jsx(VSCodeButton, { className: "w-32 shrink-0 overflow-hidden", appearance: "secondary", disabled: isRegenerating, onClick: () => {
                                    setIsRegenerating(true);
                                    onRegenerate();
                                }, children: isRegenerating ? (_jsx("span", { className: "w-full flex items-center gap-2", children: _jsx("vscode-progress-ring", { style: {
                                            width: "16px",
                                            height: "16px",
                                            "--vscode-progressBar-background": "var(--vscode-button-foreground)",
                                        } }) })) : ("Regenerate") }), _jsx(VSCodeButton, { disabled: !isSubjectValid || disabled, onClick: () => {
                                    // todo: commit
                                }, children: "Commit Changes" })] })] })] }));
}
//# sourceMappingURL=CommitMessage.js.map