"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const EmptyState = ({ searchQuery, onClearSearch }) => {
    if (searchQuery) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]", children: [(0, jsx_runtime_1.jsx)("i", { className: "codicon codicon-search text-3xl mb-4 opacity-50" }), (0, jsx_runtime_1.jsxs)("p", { className: "mb-4", children: ["No files found matching \"", searchQuery, "\""] }), (0, jsx_runtime_1.jsx)("button", { className: "px-3 py-1 text-sm rounded-sm bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]", onClick: onClearSearch, children: "Clear Search" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]", children: [(0, jsx_runtime_1.jsx)("i", { className: "codicon codicon-git-commit text-3xl mb-4 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { children: "No files have been changed" })] }));
};
exports.EmptyState = EmptyState;
