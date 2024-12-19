"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = void 0;
/**
 * Get the basename (filename) from a path
 */
const basename = (path) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
};
exports.basename = basename;
