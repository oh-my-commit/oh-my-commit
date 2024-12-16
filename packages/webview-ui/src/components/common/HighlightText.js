import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const HighlightText = ({ text, highlight, className, onMatchCount, }) => {
    if (!highlight?.trim()) {
        onMatchCount?.(0);
        return _jsx("span", { className: className, children: text });
    }
    try {
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));
        const matchCount = (parts.length - 1) / 2;
        onMatchCount?.(matchCount);
        return (_jsx("span", { className: className, children: parts.map((part, i) => part.toLowerCase() === highlight?.toLowerCase() ? (_jsxs("span", { className: "relative", children: [_jsx("span", { className: "relative z-10 font-semibold", children: part }), _jsx("span", { className: "absolute inset-0 bg-yellow-500/30 dark:bg-yellow-400/40 rounded-sm", style: { margin: "-1px -2px", padding: "1px 2px" } })] }, i)) : (part)) }));
    }
    catch (error) {
        // 如果发生错误（比如无效的正则表达式），直接返回原文本
        return _jsx("span", { className: className, children: text });
    }
};
//# sourceMappingURL=HighlightText.js.map