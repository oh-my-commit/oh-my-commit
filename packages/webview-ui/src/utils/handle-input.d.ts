export declare const getIndentationLevel: (line: string) => number;
export declare const getPreviousLineIndentLevel: (text: string, currentLineStart: number) => number;
export declare const handleKeyDown: (e: React.KeyboardEvent, text: string, selectionStart: number, selectionEnd: number, onChange: (value: string) => void, setSelectionRange: (start: number, end: number) => void) => void;
