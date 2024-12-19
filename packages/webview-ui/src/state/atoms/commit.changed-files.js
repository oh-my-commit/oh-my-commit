"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastOpenedFilePathAtom = exports.expandedDirsAtom = exports.selectedFilesAtom = exports.diffResultAtom = void 0;
const storage_1 = require("@/lib/storage");
// 文件变更状态
exports.diffResultAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.commit.changed-files",
    defaultValue: null,
});
// 选中的文件路径列表
exports.selectedFilesAtom = (0, storage_1.atomWithStorage)({
    defaultValue: [],
    key: "oh-my-commit.commit.changed-files.selected",
});
// 展开的目录列表
exports.expandedDirsAtom = (0, storage_1.atomWithStorage)({
    defaultValue: [],
    key: "oh-my-commit.commit.changed-files.expanded",
});
// 最后打开的文件路径
exports.lastOpenedFilePathAtom = (0, storage_1.atomWithStorage)({
    defaultValue: null,
    key: "oh-my-commit.commit.changed-files.last-opened",
});
