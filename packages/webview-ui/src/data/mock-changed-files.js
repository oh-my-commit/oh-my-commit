"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockFileChanges = void 0;
const common_1 = require("@shared/common");
exports.mockFileChanges = [
    {
        path: "src/components/App.tsx",
        type: common_1.GitChangeType.Modified,
        status: common_1.GitChangeType.Modified,
        additions: 10,
        deletions: 5,
        diff: "diff --git a/src/components/App.tsx b/src/components/App.tsx\n...",
        isStaged: false,
    },
    {
        path: "src/components/Header.tsx",
        type: common_1.GitChangeType.Added,
        status: common_1.GitChangeType.Added,
        additions: 20,
        deletions: 0,
        diff: "diff --git a/src/components/Header.tsx b/src/components/Header.tsx\n...",
        isStaged: false,
    },
    {
        path: "src/components/Footer.tsx",
        type: common_1.GitChangeType.Modified,
        status: common_1.GitChangeType.Modified,
        additions: 5,
        deletions: 3,
        diff: "diff --git a/src/components/Footer.tsx b/src/components/Footer.tsx\n...",
        isStaged: false,
    },
    {
        path: "src/components/Sidebar.tsx",
        type: common_1.GitChangeType.Modified,
        status: common_1.GitChangeType.Modified,
        additions: 15,
        deletions: 8,
        diff: "diff --git a/src/components/Sidebar.tsx b/src/components/Sidebar.tsx\n...",
        isStaged: false,
    },
    {
        path: "src/components/Settings.tsx",
        type: common_1.GitChangeType.Deleted,
        status: common_1.GitChangeType.Deleted,
        additions: 0,
        deletions: 50,
        diff: "diff --git a/src/components/Settings.tsx b/src/components/Settings.tsx\n...",
        isStaged: false,
    },
];
