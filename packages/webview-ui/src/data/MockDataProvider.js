import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { changedFilesAtom } from "@/state/atoms/commit.changed-files";
import { GitChangeType, } from "@oh-my-commits/shared/types";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
const mockFileChanges = [
    {
        path: "src/components/App.tsx",
        status: GitChangeType.Modified,
        additions: 10,
        deletions: 5,
        diff: "diff --git a/src/components/App.tsx b/src/components/App.tsx\n...",
    },
    {
        path: "src/components/Header.tsx",
        status: GitChangeType.Added,
        additions: 20,
        deletions: 0,
        diff: "diff --git a/src/components/Header.tsx b/src/components/Header.tsx\n...",
    },
];
const mockChangedFiles = {
    changed: mockFileChanges.length,
    files: mockFileChanges,
    insertions: mockFileChanges.reduce((acc, file) => acc + file.additions, 0),
    deletions: mockFileChanges.reduce((acc, file) => acc + file.deletions, 0),
};
export const MockDataProvider = ({ children, }) => {
    const setChangedFiles = useSetAtom(changedFilesAtom);
    useEffect(() => {
        setChangedFiles(mockChangedFiles);
    }, [setChangedFiles]);
    return _jsx(_Fragment, { children: children });
};
//# sourceMappingURL=MockDataProvider.js.map