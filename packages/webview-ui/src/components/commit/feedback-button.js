import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
export const FeedbackButton = ({ onFeedback, disabled, }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleFeedback = (type) => {
        onFeedback?.(type);
        setShowMenu(false);
    };
    return (_jsxs("div", { className: "relative", ref: menuRef, children: [_jsx("button", { className: `px-4 py-[6px] text-sm rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"} text-[var(--vscode-descriptionForeground)]`, onClick: () => !disabled && setShowMenu(!showMenu), disabled: disabled, children: _jsx("span", { children: "Improve" }) }), showMenu && (_jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 min-w-[240px] py-1 rounded-sm shadow-lg", style: {
                    backgroundColor: "var(--vscode-input-background)",
                    border: "1px solid var(--vscode-input-border)",
                }, children: [_jsxs("div", { className: "px-3 py-2 border-b border-[var(--vscode-input-border)]", children: [_jsx("div", { className: "text-xs font-medium mb-1", children: "Suggest Improvements" }), _jsx("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)]", children: "Help AI generate better commit messages" })] }), _jsxs("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("type"), children: [_jsxs("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [_jsx("span", { children: "\uD83C\uDFF7\uFE0F" }), _jsx("span", { children: "Incorrect Commit Type" })] }), _jsx("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "The selected type doesn't match the changes" })] }), _jsxs("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("content"), children: [_jsxs("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [_jsx("span", { children: "\uD83D\uDCDD" }), _jsx("span", { children: "Enhance Message" })] }), _jsx("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Message could be clearer or more descriptive" })] }), _jsxs("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("regenerate"), children: [_jsxs("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [_jsx("span", { children: "\uD83D\uDD04" }), _jsx("span", { children: "Regenerate Message" })] }), _jsx("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Start over with a new commit message" })] }), _jsx("div", { className: "border-t border-[var(--vscode-input-border)] my-1" }), _jsxs("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("other"), children: [_jsxs("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [_jsx("span", { children: "\uD83D\uDCA1" }), _jsx("span", { children: "Provide Other Feedback" })] }), _jsx("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Share additional suggestions or concerns" })] })] }))] }));
};
//# sourceMappingURL=feedback-button.js.map