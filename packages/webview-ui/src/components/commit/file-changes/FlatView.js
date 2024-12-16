import { jsx as _jsx } from "react/jsx-runtime";
import { FileItem } from "./FileItem";
export const FlatView = ({ files, selectedFiles, selectedPath, searchQuery, hasOpenedFile, onSelect, onFileClick, className, }) => {
    return (_jsx("div", { className: className, children: files.map((file) => (_jsx(FileItem, { file: file, selected: selectedFiles.includes(file.path), isOpen: selectedPath === file.path, viewMode: "flat", searchQuery: searchQuery, onSelect: onSelect, onClick: onFileClick }, file.path))) }));
};
//# sourceMappingURL=FlatView.js.map