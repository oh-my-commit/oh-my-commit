"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStats = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const FileStats = ({ stats, className }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-2 text-[12px] text-[var(--vscode-descriptionForeground)] ${className}`, children: [(0, jsx_runtime_1.jsxs)("span", { children: [Object.values(stats).reduce((a, b) => a + b, 0), " files"] }), (0, jsx_runtime_1.jsx)("span", { children: "\u00B7" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[var(--vscode-gitDecoration-addedResourceForeground)]", children: ["+", stats.added] }), (0, jsx_runtime_1.jsx)("span", { children: "\u00B7" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[var(--vscode-gitDecoration-deletedResourceForeground)]", children: ["-", stats.deleted] })] }));
};
exports.FileStats = FileStats;
