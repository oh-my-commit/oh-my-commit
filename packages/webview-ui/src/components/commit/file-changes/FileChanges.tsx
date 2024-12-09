import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { DiffViewer } from "../DiffViewer";
import { FileChangesList } from "./FileChangesList";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import { Section } from "@/components/layout/Section";
import { InfoIcon } from "@/components/commit/info-icon";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [lastOpenedFilePath] = useAtom(lastOpenedFilePathAtom);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Section
      title="Changed Files"
      actions={
        <div
          ref={tooltipContainerRef}
          className="relative inline-flex items-center"
        >
          <button
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <InfoIcon />
          </button>
          {showTooltip && (
            <div
              className="absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]"
              style={{ pointerEvents: "auto" }}
            >
              <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-2">
                <p>• Click on a file to view its changes</p>
                <p>• Use ↑↓ keys to navigate between files</p>
                <p>• Press Space to stage/unstage selected files</p>
                <p>• Use Shift+Click to select multiple files</p>
              </div>
            </div>
          )}
        </div>
      }
      className="text-[11px] font-medium tracking-wide text-sidebar-title"
    >
      <Section.Content>
        <div className="flex h-full">
          <div className="w-[300px] flex-none overflow-hidden flex flex-col border-r border-panel-border">
            <FileChangesList onFileSelect={onFileSelect} />
          </div>
          {!!lastOpenedFilePath && (
            <div className="flex-1 min-w-0 overflow-auto">
              <DiffViewer />
            </div>
          )}
        </div>
      </Section.Content>
    </Section>
  );
};
