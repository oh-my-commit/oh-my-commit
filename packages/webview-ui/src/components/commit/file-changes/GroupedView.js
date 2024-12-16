import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import React from "react";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import { FileItem } from "./FileItem";
export const GroupedView = ({ files, selectedFiles, selectedPath, searchQuery, onSelect, onFileClick, }) => {
    // 按状态分组文件
    const groupedFiles = React.useMemo(() => {
        const groups = new Map();
        files.forEach((file) => {
            const status = file.status;
            if (!groups.has(status)) {
                groups.set(status, []);
            }
            groups.get(status)?.push(file);
        });
        return groups;
    }, [files]);
    return (_jsx("div", { className: "flex flex-col gap-2", children: Array.from(groupedFiles.entries()).map(([status, files]) => (_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: cn("flex items-center gap-2 px-2 py-1 text-[12px] font-medium", STATUS_COLORS[status]), children: [_jsx("span", { children: STATUS_LABELS[status] }), _jsxs("span", { className: "text-[11px] text-muted-foreground", children: [files.length, " ", files.length === 1 ? "file" : "files"] })] }), _jsx("div", { className: "flex flex-col", children: files.map((file) => (_jsx(FileItem, { file: file, selected: selectedFiles.includes(file.path), isOpen: selectedPath === file.path, searchQuery: searchQuery, onSelect: onSelect, onClick: onFileClick, viewMode: "grouped" }, file.path))) })] }, status))) }));
};
//# sourceMappingURL=GroupedView.js.map