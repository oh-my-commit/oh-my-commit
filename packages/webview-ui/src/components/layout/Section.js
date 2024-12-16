import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SectionHeader = ({ title, actions }) => {
    if (!title && !actions)
        return null;
    return (_jsxs("div", { className: "section-header flex items-center justify-between", children: [title && (_jsx("h1", { className: "section-title text-base font-medium text-[var(--vscode-editor-foreground)]", children: title })), actions && _jsx("div", { className: "section-actions", children: actions })] }));
};
const SectionContent = ({ children, className = "" }) => {
    return (_jsx("div", { className: `section-content flex flex-col gap-2 ${className}`, children: children }));
};
const SectionFooter = ({ children, className = "" }) => {
    if (!children)
        return null;
    return (_jsx("div", { className: `section-footer flex items-center justify-between ${className}`, children: children }));
};
export const Section = ({ children, className = "", title, actions, }) => {
    return (_jsxs("section", { className: `m-4 flex flex-col gap-4 ${className} bg-[var(--vscode-input-background)] p-3 rounded-sm border border-[var(--vscode-input-border)]`, children: [_jsx(SectionHeader, { title: title, actions: actions }), children] }));
};
Section.Content = SectionContent;
Section.Footer = SectionFooter;
//# sourceMappingURL=Section.js.map