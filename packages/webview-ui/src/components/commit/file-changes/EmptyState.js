import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const EmptyState = ({ searchQuery, onClearSearch, }) => {
    if (searchQuery) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]", children: [_jsx("i", { className: "codicon codicon-search text-3xl mb-4 opacity-50" }), _jsxs("p", { className: "mb-4", children: ["No files found matching \"", searchQuery, "\""] }), _jsx("button", { className: "px-3 py-1 text-sm rounded-sm bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]", onClick: onClearSearch, children: "Clear Search" })] }));
    }
    return (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 text-center text-[var(--vscode-descriptionForeground)]", children: [_jsx("i", { className: "codicon codicon-git-commit text-3xl mb-4 opacity-50" }), _jsx("p", { children: "No files have been changed" })] }));
};
//# sourceMappingURL=EmptyState.js.map