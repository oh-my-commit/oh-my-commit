"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitFormatTooltip = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const loadMarkdown_1 = require("@/utils/loadMarkdown");
const marked_react_1 = __importDefault(require("marked-react"));
const react_1 = require("react");
const CommitFormatTooltip = () => {
    const [markdown, setMarkdown] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchMarkdown = async () => {
            try {
                const content = await (0, loadMarkdown_1.loadMarkdown)("commit-specification");
                setMarkdown(content);
            }
            catch (error) {
                console.error("Failed to load markdown:", error);
                setMarkdown("Failed to load commit format guide. Please try again later.");
            }
            finally {
                setLoading(false);
            }
        };
        fetchMarkdown();
    }, []);
    const renderer = {
        code(code, language) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: "code-block", children: [(0, jsx_runtime_1.jsx)("div", { className: "code-block-header", children: language || "text" }), (0, jsx_runtime_1.jsx)("pre", { children: (0, jsx_runtime_1.jsx)("code", { children: code }) })] }, `${language}-${code.slice(0, 20)}`));
        },
        html(html) {
            // Skip HTML comments
            if (html.startsWith("<!--") && html.endsWith("-->")) {
                return null;
            }
            return html;
        },
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]", style: { pointerEvents: "auto" }, children: (0, jsx_runtime_1.jsxs)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3 markdown-content", children: [loading ? (0, jsx_runtime_1.jsx)("div", { children: "Loading..." }) : (0, jsx_runtime_1.jsx)(marked_react_1.default, { value: markdown, renderer: renderer }), (0, jsx_runtime_1.jsx)("div", { className: "pt-2 border-t border-[var(--vscode-widget-border)]", children: (0, jsx_runtime_1.jsxs)("a", { href: "https://www.conventionalcommits.org", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:underline", onClick: e => {
                            e.preventDefault();
                            const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: "openUrl",
                                data: "https://www.conventionalcommits.org",
                            });
                        }, children: ["Learn more about Conventional Commits", (0, jsx_runtime_1.jsx)("i", { className: "codicon codicon-link-external text-[10px]" })] }) })] }) }));
};
exports.CommitFormatTooltip = CommitFormatTooltip;
