import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const FileStats = ({ stats, className }) => {
    return (_jsxs("div", { className: `flex items-center gap-2 text-[12px] text-[var(--vscode-descriptionForeground)] ${className}`, children: [_jsxs("span", { children: [Object.values(stats).reduce((a, b) => a + b, 0), " files"] }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { className: "text-[var(--vscode-gitDecoration-addedResourceForeground)]", children: ["+", stats.added] }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { className: "text-[var(--vscode-gitDecoration-deletedResourceForeground)]", children: ["-", stats.deleted] })] }));
};
//# sourceMappingURL=FileStats.js.map