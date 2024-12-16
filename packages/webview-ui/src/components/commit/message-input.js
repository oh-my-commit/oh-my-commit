import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VSCodeTextArea, VSCodeTextField, } from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
export const MessageInput = ({ value, maxLength, placeholder, onChange, onEnter, className, multiline = false, }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && onEnter) {
            e.preventDefault();
            onEnter();
        }
    };
    return (_jsxs("div", { className: "relative group", children: [_jsx("style", { children: `
          .message-textarea::part(control) {
            min-height: 120px;
            resize: vertical;
            overflow-y: auto;
            padding-bottom: 20px !important;
          }

          .message-textarea::part(control)::-webkit-scrollbar {
            width: 8px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 4px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
          }

          .message-textarea::part(control)::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-activeBackground);
          }

          .message-textarea::part(control)::-webkit-resizer {
            padding: 6px;
          }
        ` }), multiline ? (_jsx(VSCodeTextArea, { className: cn("w-full message-textarea", className), value: value, placeholder: placeholder, onKeyDown: handleKeyDown, onChange: (e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxLength) {
                        onChange(newValue);
                    }
                } })) : (_jsx(VSCodeTextField, { className: cn("w-full", className), value: value, placeholder: placeholder, onKeyDown: handleKeyDown, onChange: (e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxLength) {
                        onChange(newValue);
                    }
                } })), _jsxs("div", { className: "absolute right-2 bottom-2 text-[10px] text-[var(--vscode-descriptionForeground)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1 bg-[var(--vscode-editor-background)]", children: [value.length, "/", maxLength] })] }));
};
//# sourceMappingURL=message-input.js.map