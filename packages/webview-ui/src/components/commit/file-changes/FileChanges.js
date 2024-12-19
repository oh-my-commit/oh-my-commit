"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChanges = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Section_1 = require("@/components/layout/Section");
const utils_1 = require("@/lib/utils");
const search_1 = require("@/state/atoms/search");
const ui_1 = require("@/state/atoms/ui");
const jotai_1 = require("jotai");
const react_1 = require("react");
const vscode_client_logger_1 = require("@/lib/vscode-client-logger");
const commit_changed_files_1 = require("@/state/atoms/commit.changed-files");
const DiffViewer_1 = require("./DiffViewer");
const EmptyState_1 = require("./EmptyState");
const FlatView_1 = require("./FlatView");
const SearchBar_1 = require("./SearchBar");
const FileChanges = () => {
    const [diffResult, setDiffResult] = (0, jotai_1.useAtom)(commit_changed_files_1.diffResultAtom);
    const initialSelection = diffResult?.files?.map(file => file.file) || [];
    const [selectedFiles, setSelectedFiles] = (0, jotai_1.useAtom)(commit_changed_files_1.selectedFilesAtom);
    const [lastOpenedFilePath, setLastOpenedFilePath] = (0, jotai_1.useAtom)(commit_changed_files_1.lastOpenedFilePathAtom);
    const [viewMode] = (0, jotai_1.useAtom)(ui_1.viewModeAtom);
    const [searchQuery] = (0, jotai_1.useAtom)(search_1.searchQueryAtom);
    const handleSelect = (0, react_1.useCallback)((path) => {
        setSelectedFiles(selectedFiles.includes(path)
            ? selectedFiles.filter(p => p !== path)
            : [...selectedFiles, path]);
    }, [selectedFiles]);
    const hasSelectionChanged = initialSelection.length > 0 &&
        (initialSelection.length !== selectedFiles.length ||
            !initialSelection.every(file => selectedFiles.includes(file)));
    const handleClick = (path) => {
        setLastOpenedFilePath(path);
    };
    const renderFileView = () => {
        if (!diffResult?.files?.length) {
            return (0, jsx_runtime_1.jsx)(EmptyState_1.EmptyState, {});
        }
        switch (viewMode) {
            case "flat":
                return ((0, jsx_runtime_1.jsx)(FlatView_1.FlatView, { selectedFiles: selectedFiles, selectedPath: lastOpenedFilePath || undefined, searchQuery: searchQuery || "", hasOpenedFile: !!lastOpenedFilePath, onSelect: handleSelect, onClick: handleClick }));
            case "tree":
                return "todo";
            default:
                return null;
        }
    };
    (0, react_1.useEffect)(() => {
        vscode_client_logger_1.vscodeClientLogger.setChannel("file-changes");
        vscode_client_logger_1.vscodeClientLogger.info({
            selectedFiles,
            lastOpenedFilePath,
        });
    }, [selectedFiles, lastOpenedFilePath]);
    return ((0, jsx_runtime_1.jsx)(Section_1.Section, { title: "Changed Files", actions: hasSelectionChanged ? ((0, jsx_runtime_1.jsxs)("div", { className: "shrink-0 text-xs text-[var(--vscode-notificationsInfoIcon-foreground)] flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("i", { className: "codicon codicon-info" }), (0, jsx_runtime_1.jsx)("span", { children: "File selection changed. You can regenerate the commit message." })] })) : undefined, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row h-full relative", children: [(0, jsx_runtime_1.jsxs)("div", { className: "w-full sm:max-w-[300px] flex flex-col pr-[1px] shrink-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2 mb-2 w-full z-10 py-1", children: (0, jsx_runtime_1.jsx)(SearchBar_1.SearchBar, {}) }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-y-auto vscode-scrollbar", children: renderFileView() })] }), (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("flex-1 border-l border-[var(--vscode-panel-border)] pl-3 transition-all duration-200 ease-in-out", !lastOpenedFilePath && "opacity-0"), children: lastOpenedFilePath && ((0, jsx_runtime_1.jsx)("div", { className: "sticky top-0 h-full", children: (0, jsx_runtime_1.jsx)(DiffViewer_1.DiffViewer, {}) })) })] }) }));
};
exports.FileChanges = FileChanges;
