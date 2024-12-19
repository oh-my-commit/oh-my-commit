"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const FeedbackButton = ({ onFeedback, disabled, }) => {
    const [showMenu, setShowMenu] = (0, react_1.useState)(false);
    const menuRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative", ref: menuRef, children: [(0, jsx_runtime_1.jsx)("button", { className: `px-4 py-[6px] text-sm rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"} text-[var(--vscode-descriptionForeground)]`, onClick: () => !disabled && setShowMenu(!showMenu), disabled: disabled, children: (0, jsx_runtime_1.jsx)("span", { children: "Improve" }) }), showMenu && ((0, jsx_runtime_1.jsxs)("div", { className: "absolute right-0 top-full mt-1 z-50 min-w-[240px] py-1 rounded-sm shadow-lg", style: {
                    backgroundColor: "var(--vscode-input-background)",
                    border: "1px solid var(--vscode-input-border)",
                }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-2 border-b border-[var(--vscode-input-border)]", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-medium mb-1", children: "Suggest Improvements" }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)]", children: "Help AI generate better commit messages" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("type"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83C\uDFF7\uFE0F" }), (0, jsx_runtime_1.jsx)("span", { children: "Incorrect Commit Type" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "The selected type doesn't match the changes" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("content"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsx)("span", { children: "Enhance Message" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Message could be clearer or more descriptive" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("regenerate"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD04" }), (0, jsx_runtime_1.jsx)("span", { children: "Regenerate Message" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Start over with a new commit message" })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-[var(--vscode-input-border)] my-1" }), (0, jsx_runtime_1.jsxs)("button", { className: "w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group", onClick: () => handleFeedback("other"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-[11px] font-medium", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCA1" }), (0, jsx_runtime_1.jsx)("span", { children: "Provide Other Feedback" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]", children: "Share additional suggestions or concerns" })] })] }))] }));
};
exports.FeedbackButton = FeedbackButton;
