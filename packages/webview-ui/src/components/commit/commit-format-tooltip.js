import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { loadMarkdown } from "@/utils/loadMarkdown";
import Markdown from "marked-react";
import { useEffect, useState } from "react";
export const CommitFormatTooltip = () => {
    const [markdown, setMarkdown] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                const content = await loadMarkdown("commit-specification");
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
            return (_jsxs("div", { className: "code-block", children: [_jsx("div", { className: "code-block-header", children: language || "text" }), _jsx("pre", { children: _jsx("code", { children: code }) })] }, `${language}-${code.slice(0, 20)}`));
        },
        html(html) {
            // Skip HTML comments
            if (html.startsWith("<!--") && html.endsWith("-->")) {
                return null;
            }
            return html;
        },
    };
    return (_jsx("div", { className: "absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]", style: { pointerEvents: "auto" }, children: _jsxs("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3 markdown-content", children: [loading ? (_jsx("div", { children: "Loading..." })) : (_jsx(Markdown, { value: markdown, renderer: renderer })), _jsx("div", { className: "pt-2 border-t border-[var(--vscode-widget-border)]", children: _jsxs("a", { href: "https://www.conventionalcommits.org", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] hover:underline", onClick: (e) => {
                            e.preventDefault();
                            const vscode = acquireVsCodeApi();
                            vscode.postMessage({
                                command: "openUrl",
                                data: "https://www.conventionalcommits.org",
                            });
                        }, children: ["Learn more about Conventional Commits", _jsx("i", { className: "codicon codicon-link-external text-[10px]" })] }) })] }) }));
};
//# sourceMappingURL=commit-format-tooltip.js.map