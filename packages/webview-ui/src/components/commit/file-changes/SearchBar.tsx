import { searchQueryAtom } from "@/state/atoms/search";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
import React from "react";

interface SearchBarProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  return (
    <div className={className}>
      <div className="relative flex items-center">
        <i className="codicon codicon-search absolute left-2 translate-y-[2px] text-[12px] opacity-50 pointer-events-none z-10" />
        <style>
          {`
            .search-input::part(control) {
              padding-left: 24px !important;
            }
          `}
        </style>
        <VSCodeTextField
          className="w-full search-input"
          placeholder="Filter"
          value={searchQuery}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setSearchQuery(target.value);
          }}
        />
      </div>
    </div>
  );
};
