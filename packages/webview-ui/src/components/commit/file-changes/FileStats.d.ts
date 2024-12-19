import React from "react";
interface FileStatsProps {
    stats: {
        added: number;
        modified: number;
        deleted: number;
        renamed: number;
    };
    className?: string;
}
export declare const FileStats: React.FC<FileStatsProps>;
export {};
