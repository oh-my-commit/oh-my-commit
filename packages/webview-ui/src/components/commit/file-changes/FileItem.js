"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileItem = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const HighlightText_1 = require("@/components/common/HighlightText");
const utils_1 = require("@/lib/utils");
const path_1 = require("@/utils/path");
const react_1 = __importStar(require("react"));
const Checkbox_1 = require("../../common/Checkbox");
const FileItem = ({ file, diff, selected, isOpen, viewMode, searchQuery = "", onSelect, onClick, }) => {
    const [pathMatchCount, setPathMatchCount] = react_1.default.useState(0);
    const [contentMatchCount, setContentMatchCount] = react_1.default.useState(0);
    const handleSelect = () => {
        onSelect(file.file);
    };
    const handleClick = (e) => {
        e.stopPropagation();
        onClick(file.file);
    };
    // 检查文件内容中的匹配
    (0, react_1.useEffect)(() => {
        if (!searchQuery || !diff) {
            setContentMatchCount(0);
            return;
        }
        const lines = diff.split("\n");
        let count = 0;
        try {
            const regex = new RegExp(searchQuery, "gi");
            lines.forEach(line => {
                const matches = line.match(regex);
                if (matches) {
                    count += matches.length;
                }
            });
        }
        catch (error) {
            // 如果正则表达式无效，忽略错误
            console.warn("Invalid regex in search query:", error);
        }
        setContentMatchCount(count);
    }, [searchQuery, diff]);
    // 只要有任何一种匹配就显示
    const hasMatch = !searchQuery || pathMatchCount > 0 || contentMatchCount > 0;
    if (!hasMatch) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("group flex items-center h-[32px] select-none cursor-pointer transition-colors duration-100 ease-in-out", isOpen
            ? "bg-list-active-bg text-list-active-fg shadow-sm"
            : selected
                ? "bg-list-inactive-bg text-list-inactive-fg"
                : "hover:bg-list-hover-bg active:bg-list-active-bg active:bg-opacity-50"), onClick: handleClick, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex items-center min-w-0 h-full", children: [(0, jsx_runtime_1.jsx)("div", { className: "checkbox-container flex items-center justify-center w-8 h-full transition-opacity duration-100 cursor-pointer", onClick: e => {
                            e.stopPropagation();
                            handleSelect();
                        }, children: (0, jsx_runtime_1.jsx)(Checkbox_1.Checkbox, { checked: selected, onChange: handleSelect }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex items-center gap-2 truncate text-[13px] pl-1 pr-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-0.5 transition-colors duration-100", children: (0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)("font-mono font-medium text-[12px]", 
                                    // STATUS_COLORS[file.status as keyof typeof STATUS_COLORS],
                                    selected && "text-inherit") }) }), (0, jsx_runtime_1.jsx)("span", { className: "truncate", children: (0, jsx_runtime_1.jsx)(HighlightText_1.HighlightText, { text: viewMode === "tree" ? (0, path_1.basename)(file.file) : file.file, highlight: searchQuery, onMatchCount: setPathMatchCount }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-center gap-2 px-2 text-[12px] tabular-nums transition-colors duration-100", !selected && "text-[var(--vscode-descriptionForeground)]"), children: [searchQuery && (pathMatchCount > 0 || contentMatchCount > 0) && ((0, jsx_runtime_1.jsxs)("span", { className: (0, utils_1.cn)("text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)] px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1", selected && "opacity-80"), children: [pathMatchCount > 0 && (0, jsx_runtime_1.jsx)("span", { title: "Matches in filename", children: pathMatchCount }), pathMatchCount > 0 && contentMatchCount > 0 && (0, jsx_runtime_1.jsx)("span", { className: "opacity-40", children: "\u00B7" }), contentMatchCount > 0 && (0, jsx_runtime_1.jsx)("span", { title: "Matches in content", children: contentMatchCount })] })), !file.binary && file.insertions > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: (0, utils_1.cn)("text-git-added-fg", selected && "text-inherit"), children: ["+", file.insertions] })), !file.binary && file.deletions > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: (0, utils_1.cn)("text-git-deleted-fg", selected && "text-inherit"), children: ["\u2212", file.deletions] }))] })] }));
};
exports.FileItem = FileItem;
