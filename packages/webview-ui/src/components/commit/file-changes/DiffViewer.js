"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffViewer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const HighlightText_1 = require("@/components/common/HighlightText");
const commit_changed_files_1 = require("@/state/atoms/commit.changed-files");
const search_1 = require("@/state/atoms/search");
const ui_1 = require("@/state/atoms/ui");
const react_1 = require("@vscode/webview-ui-toolkit/react");
const classnames_1 = __importDefault(require("classnames"));
const jotai_1 = require("jotai");
const react_2 = require("react");
const DiffViewer = () => {
    const [wrapLine, setWrapLine] = (0, jotai_1.useAtom)(ui_1.diffWrapLineAtom);
    const [searchQuery] = (0, jotai_1.useAtom)(search_1.searchQueryAtom);
    const [lastOpenedFilePath, setLastOpenedFilePath] = (0, jotai_1.useAtom)(commit_changed_files_1.lastOpenedFilePathAtom);
    const [files] = (0, jotai_1.useAtom)(commit_changed_files_1.diffResultAtom);
    const selectedFile = files?.files?.find(f => f.file === lastOpenedFilePath);
    if (!selectedFile) {
        return null;
    }
    if (!selectedFile.diff) {
        return (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full", children: "No diff available" });
    }
    const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text";
    const language = (0, react_2.useMemo)(() => getLanguageFromExtension(ext), [ext]);
    const lines = selectedFile.diff.split("\n");
    const scrollContainerRef = (0, react_2.useRef)(null);
    const scrollPositionRef = (0, react_2.useRef)({});
    const saveScrollPosition = (0, react_2.useCallback)(() => {
        if (scrollContainerRef.current && lastOpenedFilePath) {
            scrollPositionRef.current[lastOpenedFilePath] = scrollContainerRef.current.scrollTop;
        }
    }, [lastOpenedFilePath]);
    (0, react_2.useEffect)(() => {
        if (scrollContainerRef.current && lastOpenedFilePath) {
            const savedPosition = scrollPositionRef.current[lastOpenedFilePath];
            if (savedPosition !== undefined) {
                scrollContainerRef.current.scrollTop = savedPosition;
            }
            else {
                scrollContainerRef.current.scrollTop = 0;
            }
        }
    }, [lastOpenedFilePath]);
    const handleClose = () => {
        saveScrollPosition();
        setLastOpenedFilePath("");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-rows-[auto_1fr] h-full overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "border-b min-w-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-2 gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "min-w-0", children: (0, jsx_runtime_1.jsx)("span", { className: "font-medium truncate block", children: selectedFile.path }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 shrink-0", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-green-600 dark:text-green-400", children: ["+", selectedFile.additions] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-red-600 dark:text-red-400", children: ["-", selectedFile.deletions] }), (0, jsx_runtime_1.jsx)(react_1.VSCodeButton, { appearance: "icon", title: wrapLine ? "Disable Line Wrap" : "Enable Line Wrap", onClick: () => setWrapLine(!wrapLine), className: (0, classnames_1.default)(wrapLine && "bg-[var(--vscode-toolbar-activeBackground)]", "rounded-[3px]"), children: (0, jsx_runtime_1.jsx)("i", { className: (0, classnames_1.default)("codicon codicon-word-wrap transition-transform", wrapLine && "opacity-100", !wrapLine && "opacity-60 hover:opacity-100") }) }), (0, jsx_runtime_1.jsx)(react_1.VSCodeButton, { appearance: "icon", title: "Close diff view", onClick: handleClose, children: (0, jsx_runtime_1.jsx)("span", { className: "codicon codicon-close" }) })] })] }) }), (0, jsx_runtime_1.jsx)("div", { ref: scrollContainerRef, className: "min-w-0 overflow-auto h-[calc(100vh-120px)]", onScroll: () => saveScrollPosition(), children: (0, jsx_runtime_1.jsx)("table", { className: "w-full border-collapse", children: (0, jsx_runtime_1.jsx)("tbody", { className: (0, classnames_1.default)("font-mono text-sm", wrapLine && "whitespace-pre-wrap", !wrapLine && "whitespace-pre"), children: lines.map((line, index) => {
                            const bgColor = line.startsWith("+")
                                ? "bg-opacity-20 bg-[var(--vscode-diffEditor-insertedTextBackground)]"
                                : line.startsWith("-")
                                    ? "bg-opacity-20 bg-[var(--vscode-diffEditor-removedTextBackground)]"
                                    : "";
                            return ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { className: (0, classnames_1.default)("pl-2 py-[1px]", bgColor), children: (0, jsx_runtime_1.jsx)(HighlightText_1.HighlightText, { text: line, highlight: searchQuery || "" }) }) }, index));
                        }) }) }) })] }));
};
exports.DiffViewer = DiffViewer;
const getLanguageFromExtension = (ext) => {
    const languageMap = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        // Add more mappings as needed
    };
    return languageMap[ext] || "text";
};
