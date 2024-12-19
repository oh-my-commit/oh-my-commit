"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_LABELS = exports.STATUS_LETTERS = exports.STATUS_COLORS = void 0;
exports.STATUS_COLORS = {
    added: "text-git-added-fg",
    modified: "text-git-modified-fg",
    deleted: "text-git-deleted-fg",
    renamed: "text-git-renamed-fg",
    copied: "text-git-copied-fg",
    unmerged: "text-git-unmerged-fg",
    unknown: "text-git-unknown-fg",
};
// File change status letters (Git-style)
exports.STATUS_LETTERS = {
    added: "A",
    modified: "M",
    deleted: "D",
    renamed: "R",
    copied: "C",
    unmerged: "U",
    unknown: "?",
};
// File change status labels (for tooltips)
exports.STATUS_LABELS = {
    added: "Added",
    modified: "Modified",
    deleted: "Deleted",
    renamed: "Renamed",
    copied: "Copied",
    unmerged: "Unmerged",
    unknown: "Unknown",
};
