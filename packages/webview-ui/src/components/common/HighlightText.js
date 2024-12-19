"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightText = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const HighlightText = ({ text, highlight, className, onMatchCount, }) => {
    if (!highlight?.trim()) {
        onMatchCount?.(0);
        return (0, jsx_runtime_1.jsx)("span", { className: className, children: text });
    }
    try {
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));
        const matchCount = (parts.length - 1) / 2;
        onMatchCount?.(matchCount);
        return ((0, jsx_runtime_1.jsx)("span", { className: className, children: parts.map((part, i) => part.toLowerCase() === highlight?.toLowerCase() ? ((0, jsx_runtime_1.jsxs)("span", { className: "relative", children: [(0, jsx_runtime_1.jsx)("span", { className: "relative z-10 font-semibold", children: part }), (0, jsx_runtime_1.jsx)("span", { className: "absolute inset-0 bg-yellow-500/30 dark:bg-yellow-400/40 rounded-sm", style: { margin: "-1px -2px", padding: "1px 2px" } })] }, i)) : (part)) }));
    }
    catch (error) {
        // 如果发生错误（比如无效的正则表达式），直接返回原文本
        return (0, jsx_runtime_1.jsx)("span", { className: className, children: text });
    }
};
exports.HighlightText = HighlightText;
