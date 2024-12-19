"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SectionHeader = ({ title, actions }) => {
    if (!title && !actions)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "section-header flex items-center justify-between", children: [title && ((0, jsx_runtime_1.jsx)("h1", { className: "section-title text-base font-medium text-[var(--vscode-editor-foreground)]", children: title })), actions && (0, jsx_runtime_1.jsx)("div", { className: "section-actions", children: actions })] }));
};
const SectionContent = ({ children, className = "" }) => {
    return (0, jsx_runtime_1.jsx)("div", { className: `section-content flex flex-col gap-2 ${className}`, children: children });
};
const SectionFooter = ({ children, className = "" }) => {
    if (!children)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: `section-footer flex items-center justify-between ${className}`, children: children }));
};
const Section = ({ children, className = "", title, actions }) => {
    return ((0, jsx_runtime_1.jsxs)("section", { className: `m-4 flex flex-col gap-4 ${className} bg-[var(--vscode-input-background)] p-3 rounded-sm border border-[var(--vscode-input-border)]`, children: [(0, jsx_runtime_1.jsx)(SectionHeader, { title: title, actions: actions }), children] }));
};
exports.Section = Section;
exports.Section.Content = SectionContent;
exports.Section.Footer = SectionFooter;
