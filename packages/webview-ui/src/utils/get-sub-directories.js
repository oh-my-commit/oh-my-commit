"use strict";
// Get all subdirectories under a path
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubDirectories = void 0;
const get_all_directory_paths_1 = require("@/utils/get-all-directory-paths");
const getSubDirectories = (fileTree, path) => {
    const allDirs = (0, get_all_directory_paths_1.getAllDirectoryPaths)(fileTree);
    return allDirs.filter(dir => dir.startsWith(path + "/"));
};
exports.getSubDirectories = getSubDirectories;
