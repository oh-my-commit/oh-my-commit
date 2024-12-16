export function getAllDirectoryPaths(node) {
    const paths = [];
    if (node.type === "directory") {
        paths.push(node.path);
        if (node.children) {
            node.children.forEach((child) => {
                if (child.type === "directory") {
                    paths.push(...getAllDirectoryPaths(child));
                }
            });
        }
    }
    return paths;
}
//# sourceMappingURL=get-all-directory-paths.js.map