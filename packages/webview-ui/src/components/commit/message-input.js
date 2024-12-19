"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@vscode/webview-ui-toolkit/react");
const classnames_1 = __importDefault(require("classnames"));
const MessageInput = ({ value, maxLength, placeholder, onChange, onEnter, className, multiline = false, }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && onEnter) {
            e.preventDefault();
            onEnter();
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative group", children: [(0, jsx_runtime_1.jsx)("style", { children: `
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
        ` }), multiline ? ((0, jsx_runtime_1.jsx)(react_1.VSCodeTextArea, { className: (0, classnames_1.default)("w-full message-textarea", className), value: value, placeholder: placeholder, onKeyDown: handleKeyDown, onChange: e => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxLength) {
                        onChange(newValue);
                    }
                } })) : ((0, jsx_runtime_1.jsx)(react_1.VSCodeTextField, { className: (0, classnames_1.default)("w-full", className), value: value, placeholder: placeholder, onKeyDown: handleKeyDown, onChange: e => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxLength) {
                        onChange(newValue);
                    }
                } })), (0, jsx_runtime_1.jsxs)("div", { className: "absolute right-2 bottom-2 text-[10px] text-[var(--vscode-descriptionForeground)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1 bg-[var(--vscode-editor-background)]", children: [value.length, "/", maxLength] })] }));
};
exports.MessageInput = MessageInput;
