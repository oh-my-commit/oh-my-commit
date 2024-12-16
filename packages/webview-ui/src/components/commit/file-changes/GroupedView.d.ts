import { GitFileChange } from "@oh-my-commits/shared/types";
import React from "react";
export interface GroupedViewProps {
    files: GitFileChange[];
    selectedFiles: string[];
    selectedPath?: string;
    searchQuery?: string;
    onSelect: (path: string) => void;
    onFileClick: (path: string) => void;
}
export declare const GroupedView: React.FC<GroupedViewProps>;
