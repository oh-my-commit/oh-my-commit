import { getVSCodeAPI } from "@/lib/getVSCodeAPI";
import { APP_NAME } from "@oh-my-commit/shared/common";
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
          handleLinkClick("https://github.com/cs-magic-open/oh-my-commit")
        }
        // className="text-xs font-normal text-editor-fg opacity-75 tracking-wider hover:text-vscode-textLink-foreground hover:opacity-90 transition-all duration-200"
      >
        <span className="mt-1 text-[9px] text-vscode-descriptionForeground opacity-40 font-light tracking-[0.15em] uppercase">
          {APP_NAME} {packageJson.version}
        </span>
      </button>
    </footer>
  );
};
