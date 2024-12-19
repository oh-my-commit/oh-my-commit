"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("../../lib/utils");
const Checkbox = ({ checked, onChange, className }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("w-3 h-3 relative", className), onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "absolute inset-0 cursor-pointer opacity-0 w-full h-full z-10", checked: checked, onChange: e => onChange(e.target.checked), onClick: e => e.stopPropagation() }), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("absolute inset-0 border rounded", "border-[var(--vscode-checkbox-border)]", checked &&
                    "bg-[var(--vscode-checkbox-background)] border-[var(--vscode-checkbox-foreground)]") }), checked && ((0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 flex items-center justify-center text-[var(--vscode-checkbox-foreground)]", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-2 h-2", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z", fill: "currentColor" }) }) }))] }));
};
exports.Checkbox = Checkbox;
