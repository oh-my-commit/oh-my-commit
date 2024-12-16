import { GitChangeSummary } from "@oh-my-commits/shared/types";
import React from "react";
interface DiffViewerProps {
    files: GitChangeSummary | null;
    lastOpenedFilePath: string | null;
}
export declare const DiffViewer: React.FC<DiffViewerProps>;
export {};
