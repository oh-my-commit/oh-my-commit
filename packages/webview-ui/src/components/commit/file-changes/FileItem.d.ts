import React from "react";
import type { DiffResult } from "simple-git";
interface FileItemProps {
    file: DiffResult["files"][0];
    diff?: string;
    selected: boolean;
    isOpen: boolean;
    viewMode: string;
    searchQuery?: string;
    onSelect: (path: string) => void;
    onClick: (path: string) => void;
}
export declare const FileItem: React.FC<FileItemProps>;
export {};
