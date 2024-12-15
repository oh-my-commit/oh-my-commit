import { getVSCodeAPI } from "@/lib/storage";
import React from "react";
import packageJson from "../../package.json";

interface FooterProps {
  className?: string;
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({ className, children }) => {
  const vscode = getVSCodeAPI();

  const handleLinkClick = (url: string) => {
    vscode.postMessage({
      command: "openExternal",
      url,
    });
  };

  return (
    <footer
      className={`
        mt-auto
        flex flex-col items-center justify-center py-3
        border-t border-panel-border border-opacity-50
        ${className || ""}
      `}
    >
      <button
        onClick={() =>
          handleLinkClick("https://github.com/cs-magic-open/oh-my-commits")
        }
        className="text-xs font-normal text-editor-fg opacity-75 tracking-wider hover:text-vscode-textLink-foreground hover:opacity-90 transition-all duration-200"
      >
        Oh My Commits
      </button>
      <span className="mt-1 text-[9px] text-vscode-descriptionForeground opacity-40 font-light tracking-[0.15em] uppercase">
        Oh My Commits
      </span>
    </footer>
  );
};
