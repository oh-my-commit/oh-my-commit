"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = Spinner;
const jsx_runtime_1 = require("react/jsx-runtime");
function Spinner({ className = "", ...props }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: `animate-spin rounded-full border-2 border-current border-t-transparent ${className}`, ...props }));
}
