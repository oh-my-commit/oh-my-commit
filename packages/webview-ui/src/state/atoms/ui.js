"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiModeAtom = exports.diffWrapLineAtom = exports.viewModeAtom = void 0;
const storage_1 = require("@/lib/storage");
// 视图模式
exports.viewModeAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.commit.view-mode",
    defaultValue: "flat",
});
// 是否换行
exports.diffWrapLineAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.commit.diff-wrap-line",
    defaultValue: false,
});
exports.uiModeAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.ui.mode",
    defaultValue: "window",
    storageType: "both",
});
