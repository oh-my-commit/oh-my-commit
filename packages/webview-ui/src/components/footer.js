"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const getVSCodeAPI_1 = require("@/lib/getVSCodeAPI");
const common_1 = require("@shared/common");
const package_json_1 = __importDefault(require("../../package.json"));
const Footer = ({ className, children }) => {
    const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
    const handleLinkClick = (url) => {
        vscode.postMessage({
            command: "openExternal",
            url,
        });
    };
    return ((0, jsx_runtime_1.jsx)("footer", { className: `
        mt-auto
        flex flex-col items-center justify-center py-3
        border-t border-panel-border border-opacity-50
        ${className || ""}
      `, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleLinkClick("https://github.com/cs-magic-open/oh-my-commit"), children: (0, jsx_runtime_1.jsxs)("span", { className: "mt-1 text-[9px] text-vscode-descriptionForeground opacity-40 font-light tracking-[0.15em] uppercase", children: [common_1.APP_NAME, " ", package_json_1.default.version] }) }) }));
};
exports.Footer = Footer;
