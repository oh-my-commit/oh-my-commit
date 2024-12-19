"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitBodyAtom = exports.commitTitleAtom = void 0;
const storage_1 = require("@/lib/storage");
// 核心状态原子
exports.commitTitleAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.commit.title",
    defaultValue: "",
});
exports.commitBodyAtom = (0, storage_1.atomWithStorage)({
    key: "oh-my-commit.commit.body",
    defaultValue: "",
});
