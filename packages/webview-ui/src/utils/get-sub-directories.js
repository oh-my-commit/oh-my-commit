// Get all subdirectories under a path
import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths";
export const getSubDirectories = (fileTree, path) => {
    const allDirs = getAllDirectoryPaths(fileTree);
    return allDirs.filter((dir) => dir.startsWith(path + "/"));
};
//# sourceMappingURL=get-sub-directories.js.map