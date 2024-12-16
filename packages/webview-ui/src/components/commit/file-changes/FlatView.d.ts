import React from "react";
import type { FileChange } from "../../../state/types";
export interface FlatViewProps {
    files: FileChange[];
    selectedFiles: string[];
    selectedPath?: string;
    searchQuery?: string;
    hasOpenedFile: boolean;
    onSelect: (path: string) => void;
    onFileClick: (path: string) => void;
    renderStatus?: (file: FileChange & {
        isStaged: boolean;
    }) => React.ReactNode;
    className?: string;
}
export declare const FlatView: React.FC<FlatViewProps>;
