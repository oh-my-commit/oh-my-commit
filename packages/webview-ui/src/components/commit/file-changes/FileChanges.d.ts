import { GitChangeSummary } from "@oh-my-commits/shared/types";
import React from "react";
interface FileChangesProps {
    changedFiles: GitChangeSummary | null;
    selectedFiles: string[];
    setSelectedFiles: (files: string[]) => void;
    lastOpenedFilePath: string | null;
    setLastOpenedFilePath: (path: string | null) => void;
}
export declare const FileChanges: React.FC<FileChangesProps>;
export {};
