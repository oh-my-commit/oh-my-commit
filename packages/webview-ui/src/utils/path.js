/**
 * Get the basename (filename) from a path
 */
export const basename = (path) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
};
//# sourceMappingURL=path.js.map