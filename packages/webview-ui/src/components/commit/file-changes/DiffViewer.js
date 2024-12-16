import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HighlightText } from "@/components/common/HighlightText";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { diffWrapLineAtom } from "@/state/atoms/ui";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
export const DiffViewer = ({ files, lastOpenedFilePath, }) => {
    const [wrapLine, setWrapLine] = useAtom(diffWrapLineAtom);
    const [searchQuery] = useAtom(searchQueryAtom);
    const setLastOpenedFilePath = useSetAtom(lastOpenedFilePathAtom);
    const selectedFile = files?.files?.find((f) => f.path === lastOpenedFilePath);
    if (!selectedFile) {
        return null;
    }
    if (!selectedFile.diff) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: "No diff available" }));
    }
    const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text";
    const language = useMemo(() => getLanguageFromExtension(ext), [ext]);
    const lines = selectedFile.diff.split("\n");
    const scrollContainerRef = useRef(null);
    const scrollPositionRef = useRef({});
    const saveScrollPosition = useCallback(() => {
        if (scrollContainerRef.current && lastOpenedFilePath) {
            scrollPositionRef.current[lastOpenedFilePath] =
                scrollContainerRef.current.scrollTop;
        }
    }, [lastOpenedFilePath]);
    useEffect(() => {
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
    return (_jsxs("div", { className: "grid grid-rows-[auto_1fr] h-full overflow-hidden", children: [_jsx("div", { className: "border-b min-w-0", children: _jsxs("div", { className: "flex items-center justify-between p-2 gap-2", children: [_jsx("div", { className: "min-w-0", children: _jsx("span", { className: "font-medium truncate block", children: selectedFile.path }) }), _jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [_jsxs("span", { className: "text-green-600 dark:text-green-400", children: ["+", selectedFile.additions] }), _jsxs("span", { className: "text-red-600 dark:text-red-400", children: ["-", selectedFile.deletions] }), _jsx(VSCodeButton, { appearance: "icon", title: wrapLine ? "Disable Line Wrap" : "Enable Line Wrap", onClick: () => setWrapLine(!wrapLine), className: cn(wrapLine && "bg-[var(--vscode-toolbar-activeBackground)]", "rounded-[3px]"), children: _jsx("i", { className: cn("codicon codicon-word-wrap transition-transform", wrapLine && "opacity-100", !wrapLine && "opacity-60 hover:opacity-100") }) }), _jsx(VSCodeButton, { appearance: "icon", title: "Close diff view", onClick: handleClose, children: _jsx("span", { className: "codicon codicon-close" }) })] })] }) }), _jsx("div", { ref: scrollContainerRef, className: "min-w-0 overflow-auto h-[calc(100vh-120px)]", onScroll: () => saveScrollPosition(), children: _jsx("table", { className: "w-full border-collapse", children: _jsx("tbody", { className: cn("font-mono text-sm", wrapLine && "whitespace-pre-wrap", !wrapLine && "whitespace-pre"), children: lines.map((line, index) => {
                            const bgColor = line.startsWith("+")
                                ? "bg-opacity-20 bg-[var(--vscode-diffEditor-insertedTextBackground)]"
                                : line.startsWith("-")
                                    ? "bg-opacity-20 bg-[var(--vscode-diffEditor-removedTextBackground)]"
                                    : "";
                            return (_jsx("tr", { children: _jsx("td", { className: cn("pl-2 py-[1px]", bgColor), children: _jsx(HighlightText, { text: line, highlight: searchQuery || "" }) }) }, index));
                        }) }) }) })] }));
};
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
//# sourceMappingURL=DiffViewer.js.map