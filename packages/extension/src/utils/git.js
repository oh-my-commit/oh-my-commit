"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitCore = void 0;
var fs = require("fs");
var path = require("path");
var simple_git_1 = require("simple-git");
var GitCore = /** @class */ (function () {
    function GitCore(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.git = (0, simple_git_1.default)(workspaceRoot);
    }
    /**
     * 获取已暂存文件的详细信息和统计摘要
     * @returns GitStagedSummary 包含每个文件的变更详情和总体统计
     */
    GitCore.prototype.getDiffSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var diff, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.git.diffSummary("--staged")];
                    case 1:
                        diff = _a.sent();
                        files = diff.files.map(function (file) { return ({
                            path: file.file,
                            insertions: file.insertions,
                            deletions: file.deletions,
                            changes: file.changes,
                            binary: file.binary || false,
                        }); });
                        return [2 /*return*/, {
                                files: files,
                                total: {
                                    files: diff.files.length,
                                    insertions: diff.insertions,
                                    deletions: diff.deletions,
                                    changes: diff.changes,
                                },
                            }];
                }
            });
        });
    };
    /**
     * 暂存所有变更，包括新增、修改和删除的文件
     * 这是 getChanges 的前置操作，确保所有文件都被 git 跟踪
     * @throws 如果暂存操作失败
     */
    GitCore.prototype.stageAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.git.add("-A")];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to stage changes: ".concat(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GitCore.prototype.isGitRepository = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gitDir, stats, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.workspaceRoot) {
                            return [2 /*return*/, false];
                        }
                        gitDir = path.join(this.workspaceRoot, ".git");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.promises.stat(gitDir)];
                    case 2:
                        stats = _a.sent();
                        return [2 /*return*/, stats.isDirectory()];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitCore.prototype.commit = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[GitCore] Committing changes");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.git.commit(message)];
                    case 2:
                        _a.sent();
                        console.log("[GitCore] Changes committed successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("[GitCore] Failed to commit changes:", error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitCore.prototype.hasChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.git.status()];
                    case 1:
                        status_1 = _a.sent();
                        return [2 /*return*/, !status_1.isClean()];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Failed to check changes: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GitCore.prototype.getLastCommitMessage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("[GitCore] Getting last commit message");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.git.log(["-1"])];
                    case 2:
                        result = _c.sent();
                        console.log("[GitCore] Last commit message:", (_a = result.latest) === null || _a === void 0 ? void 0 : _a.hash);
                        return [2 /*return*/, ((_b = result.latest) === null || _b === void 0 ? void 0 : _b.message) || ""];
                    case 3:
                        error_5 = _c.sent();
                        console.error("[GitCore] Failed to get last commit message:", error_5);
                        return [2 /*return*/, ""];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitCore.prototype.amendCommit = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[GitCore] Amending last commit");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.git.commit(message, ["--amend"])];
                    case 2:
                        _a.sent();
                        console.log("[GitCore] Last commit amended successfully");
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error("[GitCore] Failed to amend last commit:", error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GitCore;
}());
exports.GitCore = GitCore;
