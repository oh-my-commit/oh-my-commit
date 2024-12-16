import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { DiffViewer } from "./DiffViewer";
import { EmptyState } from "./EmptyState";
import { FlatView } from "./FlatView";
import { SearchBar } from "./SearchBar";
import { logger } from "@/lib/logger";
export const FileChanges = ({ changedFiles, selectedFiles, setSelectedFiles, lastOpenedFilePath, setLastOpenedFilePath, }) => {
    const [viewMode] = useAtom(viewModeAtom);
    const [searchQuery] = useAtom(searchQueryAtom);
    const [initialSelection, setInitialSelection] = useState([]);
    useEffect(() => {
        if (changedFiles?.files?.length && selectedFiles.length === 0) {
            const allFiles = changedFiles.files.map((file) => file.path);
            setSelectedFiles(allFiles);
            setInitialSelection(allFiles);
        }
    }, [changedFiles, setSelectedFiles, selectedFiles.length]);
    useEffect(() => {
        if (changedFiles?.files?.length && initialSelection.length === 0) {
            const allFiles = changedFiles.files.map((file) => file.path);
            setInitialSelection(allFiles);
        }
    }, [changedFiles]);
    const handleFileSelect = (path) => {
        setSelectedFiles(selectedFiles.includes(path)
            ? selectedFiles.filter((p) => p !== path)
            : [...selectedFiles, path]);
    };
    const hasSelectionChanged = initialSelection.length > 0 &&
        (initialSelection.length !== selectedFiles.length ||
            !initialSelection.every((file) => selectedFiles.includes(file)));
    logger.info("initialSelection: ", initialSelection);
    logger.info("selectedFiles: ", selectedFiles);
    logger.info("hasSelectionChanged: ", hasSelectionChanged);
    const handleFileClick = (path) => {
        setLastOpenedFilePath(path);
    };
    const renderFileView = () => {
        if (!changedFiles?.files?.length) {
            return _jsx(EmptyState, {});
        }
        const fileChanges = changedFiles.files.map((file) => ({
            ...file,
            type: file.status,
            isStaged: false,
        }));
        switch (viewMode) {
            case "flat":
                return (_jsx(FlatView, { files: fileChanges, selectedFiles: selectedFiles, selectedPath: lastOpenedFilePath || undefined, searchQuery: searchQuery || "", hasOpenedFile: !!lastOpenedFilePath, onSelect: handleFileSelect, onFileClick: (path) => handleFileClick(path) }));
            case "tree":
                return "todo";
            default:
                return null;
        }
    };
    return (_jsx(Section, { title: "Changed Files", actions: hasSelectionChanged ? (_jsxs("div", { className: "shrink-0 text-xs text-[var(--vscode-notificationsInfoIcon-foreground)] flex items-center gap-1", children: [_jsx("i", { className: "codicon codicon-info" }), _jsx("span", { children: "File selection changed. You can regenerate the commit message." })] })) : undefined, children: _jsxs("div", { className: "flex flex-col sm:flex-row h-full relative", children: [_jsxs("div", { className: "w-full sm:max-w-[300px] flex flex-col pr-[1px] shrink-0", children: [_jsx("div", { className: "flex items-center gap-2 mb-2 w-full z-10 py-1", children: _jsx(SearchBar, {}) }), _jsx("div", { className: "overflow-y-auto vscode-scrollbar", children: renderFileView() })] }), _jsx("div", { className: cn("flex-1 border-l border-[var(--vscode-panel-border)] pl-3 transition-all duration-200 ease-in-out", !lastOpenedFilePath && "opacity-0"), children: lastOpenedFilePath && (_jsx("div", { className: "sticky top-0 h-full", children: _jsx(DiffViewer, { files: changedFiles, lastOpenedFilePath: lastOpenedFilePath }) })) })] }) }));
};
//# sourceMappingURL=FileChanges.js.map