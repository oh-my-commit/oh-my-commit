"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDirectoryPaths = getAllDirectoryPaths;
function getAllDirectoryPaths(node) {
    const paths = [];
    if (node.type === "directory") {
        paths.push(node.path);
        if (node.children) {
            node.children.forEach(child => {
                if (child.type === "directory") {
                    paths.push(...getAllDirectoryPaths(child));
                }
            });
        }
    }
    return paths;
}
