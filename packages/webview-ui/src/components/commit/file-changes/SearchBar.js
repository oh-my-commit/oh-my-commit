"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const search_1 = require("@/state/atoms/search");
const react_1 = require("@vscode/webview-ui-toolkit/react");
const jotai_1 = require("jotai");
const SearchBar = ({ className }) => {
    const [searchQuery, setSearchQuery] = (0, jotai_1.useAtom)(search_1.searchQueryAtom);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative grow overflow-hidden flex items-center  border border-[var(--vscode-input-border)] rounded-sm", children: [(0, jsx_runtime_1.jsx)("i", { className: "codicon codicon-search absolute left-2 translate-y-[2px] text-[12px] opacity-50 pointer-events-none z-10 " }), (0, jsx_runtime_1.jsx)("style", { children: `
            .search-input::part(control) {
              padding-left: 24px !important;
            }
          ` }), (0, jsx_runtime_1.jsx)(react_1.VSCodeTextField, { className: "w-full search-input", placeholder: "Filter", value: searchQuery, onInput: e => {
                    const target = e.target;
                    setSearchQuery(target.value);
                } })] }));
};
exports.SearchBar = SearchBar;
