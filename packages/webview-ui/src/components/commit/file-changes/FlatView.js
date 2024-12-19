"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const commit_changed_files_1 = require("@/state/atoms/commit.changed-files");
const jotai_1 = require("jotai");
const FileItem_1 = require("./FileItem");
const FlatView = ({ selectedFiles, selectedPath, searchQuery, hasOpenedFile, onSelect, onClick, className, }) => {
    const [diffResult] = (0, jotai_1.useAtom)(commit_changed_files_1.diffResultAtom);
    const diff = "todo: diff"; // todo
    return ((0, jsx_runtime_1.jsx)("div", { className: className, children: diffResult?.files.map((file, index) => ((0, jsx_runtime_1.jsx)(FileItem_1.FileItem, { file: file, diff: diff, selected: selectedFiles.includes(file.file), isOpen: selectedPath === file.file, viewMode: "flat", searchQuery: searchQuery, onSelect: onSelect, onClick: onClick }, index))) }));
};
exports.FlatView = FlatView;
