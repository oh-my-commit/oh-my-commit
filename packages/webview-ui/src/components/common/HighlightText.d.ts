import React from "react";
interface HighlightTextProps {
    text: string;
    highlight: string;
    className?: string;
    onMatchCount?: (count: number) => void;
}
export declare const HighlightText: React.FC<HighlightTextProps>;
export {};
