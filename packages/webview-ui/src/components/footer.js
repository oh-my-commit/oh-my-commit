import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { getVSCodeAPI } from "@/lib/storage";
import { APP_NAME } from "@oh-my-commits/shared/constants";
import packageJson from "../../package.json";
export const Footer = ({ className, children }) => {
    const vscode = getVSCodeAPI();
    const handleLinkClick = (url) => {
        vscode.postMessage({
            command: "openExternal",
            url,
        });
    };
    return (_jsx("footer", { className: `
        mt-auto
        flex flex-col items-center justify-center py-3
        border-t border-panel-border border-opacity-50
        ${className || ""}
      `, children: _jsx("button", { onClick: () => handleLinkClick("https://github.com/cs-magic-open/oh-my-commits"), children: _jsxs("span", { className: "mt-1 text-[9px] text-vscode-descriptionForeground opacity-40 font-light tracking-[0.15em] uppercase", children: [APP_NAME, " ", packageJson.version] }) }) }));
};
//# sourceMappingURL=footer.js.map