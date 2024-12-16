import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { searchQueryAtom } from "@/state/atoms/search";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
export const SearchBar = ({ className }) => {
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    return (_jsxs("div", { className: "relative grow overflow-hidden flex items-center  border border-[var(--vscode-input-border)] rounded-sm", children: [_jsx("i", { className: "codicon codicon-search absolute left-2 translate-y-[2px] text-[12px] opacity-50 pointer-events-none z-10 " }), _jsx("style", { children: `
            .search-input::part(control) {
              padding-left: 24px !important;
            }
          ` }), _jsx(VSCodeTextField, { className: "w-full search-input", placeholder: "Filter", value: searchQuery, onInput: (e) => {
                    const target = e.target;
                    setSearchQuery(target.value);
                } })] }));
};
//# sourceMappingURL=SearchBar.js.map