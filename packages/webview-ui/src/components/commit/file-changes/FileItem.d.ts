import { GitFileChange } from "@oh-my-commits/shared/types";
import React from "react";
interface FileItemProps {
    file: GitFileChange;
    selected: boolean;
    isOpen: boolean;
    viewMode: string;
    searchQuery?: string;
    onSelect: (path: string) => void;
    onClick: (path: string) => void;
}
export declare const FileItem: React.FC<FileItemProps>;
export {};
